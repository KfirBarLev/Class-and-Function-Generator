import * as vscode from 'vscode';
import * as fs from 'fs';

export async function generateGetterSetter(funcName: string)
{
	// get the currently open file
	const editor = vscode.window.activeTextEditor;
	
	if (!editor) 
	{
		return;
	}
	
	const hasSelection = editor.selection.active.character;
	var textLine: vscode.TextLine;

	// check if the user selected something, otherwise display error message
	if (hasSelection) 
	{
		textLine = editor.document.lineAt(editor.selection.active.line);
		var answer = await optionBoxs(); // for where to put the code (inline/soure/header)
		if (!answer)
		{
			return;
		}

		var wherePutTheCode: string = answer;
		var isInline: boolean = (wherePutTheCode === "inline");

		let codeText = generateGetterSetterAutomatically(textLine.text, funcName, isInline);

		if (!codeText) 
		{
			vscode.window.showErrorMessage('generate Getter Setter Automatically faild!');
			return;
		}
		
		
		var line  = getPositionForNewFunction();
		
		if (!line) 
		{
			vscode.window.showErrorMessage('getPositionForNewFunction(); faild!');
			return;
		}
	
		let generatedText = codeText;
		
		const document = editor.document;


		vscode.window.showInformationMessage(wherePutTheCode);
		
		switch (wherePutTheCode)
		{
			case "inline":
				editor.edit(edit => edit.insert(document.lineAt(line).range.end, generatedText[0]));
				break;
			case "suorce file":
				// write implemention in source file
				var sourceName = document.fileName.replace("hpp", "cpp");

				fs.appendFile(sourceName, generatedText[0], function (err)
				{
					if (err) 
					{
						console.error(err);
						return false;
					}
				});
				// put defenition on header
				editor.edit(edit => edit.insert(document.lineAt(line).range.end, generatedText[1]));
				break;
			case "header file":

				break;
				
		}
		
		
		
		
		vscode.window.showInformationMessage(funcName + " successfully created!");
	}
	else
	{
		vscode.window.showErrorMessage('Nothing was selected!');
	}
	
}

function getPositionForNewFunction() : number
{
	var line: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return 0;
	}

	var i: number = 0;
	line = editor.document.lineAt(i);

	while (!line.text.includes("private:") && "};" !== line.text )
	{
		i++;
		line = editor.document.lineAt(i);
	}

	return --i;	 
}

function getClassName() : string
{
	var line: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return '';
	}

	var i: number = 0;
	line = editor.document.lineAt(i);
	
	while (!line.text.includes("class") && "};" !== line.text )
	{
		i++;
		line = editor.document.lineAt(i);
	}

	let className = line.text.split(' ');

	return className[1];	 
}

// function sleep(ms: number) 
// {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


function generateGetterSetterAutomatically(text: any, func: string, isInline: boolean) // func="getter"/"setter"/"both"
{
	let selectedText, variableType: string, variableName: string;

	selectedText = text.replace(';', '').trim(); //removes all semicolons 
		
	variableType = selectedText.split(' ')[0];
	variableName = selectedText.split(' ')[1];	
	
	if (variableName === null || variableName === undefined) 
	{
		vscode.window.showErrorMessage('Faulty Selection. Please make sure you select a variable.');
		return; 
	}

	variableName.trim();
	variableType.trim();
	
	let code: string[] = [];

	if (func === "both") 
	{
		let tmpGet: string[] = [];
		let tmpSet: string[] = [];

		tmpGet = getterText(variableType, variableName, isInline);
		tmpSet = setterText(variableType, variableName, isInline);

		code[0] = tmpGet[0] + tmpSet[0];
		code[1] = tmpGet[1] + tmpSet[1];		
	} 
	else if (func === "getter")
	{
		code = getterText(variableType, variableName, isInline);					
	}	 
	else if (func === "setter")
	{	
		code = setterText(variableType, variableName, isInline);		
	}

	return code;
}


function optionBoxs()
{
	var option: vscode.QuickPickOptions = {};

	return vscode.window.showQuickPick(["inline", "suorce file", "header file"], option);
}


function getterText(typeName: string, variableName: string, isInline: boolean)
{
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 

	if(!isInline)
	{
	clasName =  getClassName();
	clasName += "::";
	
	defenitionText =`
	` +
	typeName + " Get" + variableNameUp  + `();
	`; 

implementationText =`
` +
typeName + " " + clasName + "Get" + variableNameUp  + `()
{
	return ` + variableName + `;
}
`;
	}
	else
	{
	implementationText =`
	` +
	typeName + " " + clasName + "Get" + variableNameUp  + `()
	{
		return ` + variableName + `;
	}
	`;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}


function setterText(typeName: string, variableName: string, isInline: boolean)
{
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 
	var clasName: string = '';
	var defenitionText = '';

	if(!isInline)
	{
		clasName =  getClassName();
		clasName += "::";
		
		defenitionText =`
		` +
		"void" + " " + clasName + "Set" + variableNameUp  + `(` + typeName + ` val);
		`; 
	}

	var implementationText = '';

	implementationText =`
	` +
	"void" + " " + clasName + "Set" + variableNameUp  + `(` + typeName + ` val)
	{
		` + variableName + ` = val; 
	}
	`;

	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}
