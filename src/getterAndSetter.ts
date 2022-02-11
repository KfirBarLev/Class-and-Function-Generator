import * as vscode from 'vscode';


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
		let codeText = await generateGetterSetterAutomatically(textLine.text, funcName);

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
	
		editor.edit(edit => edit.insert(document.lineAt(line).range.end, generatedText as unknown as string));
		
		vscode.window.showInformationMessage(generatedText + " successfully created!");
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

// function sleep(ms: number) 
// {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


async function generateGetterSetterAutomatically(text: any, func: string) // func="getter"/"setter"/"both"
{
	let generatedCode = '';

	let selectedText, indentSize, variableType: string, variableName: string;

	selectedText = text.replace(';', '').trim(); //removes all semicolons 
	indentSize = text.split(selectedText.charAt(0))[0]; //get the indent size for proper formatting
		
	variableType = selectedText.split(' ')[0];
	variableName = selectedText.split(' ')[1];	
	
	if (variableName === null || variableName === undefined) 
	{
		vscode.window.showErrorMessage('Faulty Selection. Please make sure you select a variable.');
		return; 
	}

	variableName.trim();
	variableType.trim();
	
	let code = '';
	
	
	let getter: string = '', setter: string = '';

	if (func === "both") 
	{
		code = getterText(variableType, variableName, "inline") + setterText(variableType, variableName);		
	} 
	else if (func === "getter")
	{
		var answer = await optionBoxs();

		vscode.window.showInformationMessage(answer as unknown as string);

		getter = getterText(variableType, variableName, "inline");
		code = getter;				
		
	}	 
	else if (func === "setter")
	{	
		code = setterText(variableType, variableName);		
	}

	generatedCode += code; //append the code for each selected line

	return generatedCode;
}


function optionBoxs()
{
	var option: vscode.QuickPickOptions = {};

	return vscode.window.showQuickPick(["inline", "header file", "suorce file"], option);
}


function getterText(typeName: string, variableName: string, wherePutTheCode: string)
{
    //TODO: make functiom that return class name.
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 

	var getterBuffer = '';

    switch(wherePutTheCode)
    {
        case "inline":
    getterBuffer =`
    ` +
    typeName + " Get" + variableNameUp  + `()
    {
        return ` + variableName + `;
    }
    `;
        case "header file":
        
        case "suorce file":
    }
	

	return getterBuffer;
}


function setterText(typeName: string, variableName: string)
{
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 

	var setterBuffer = '';

	setterBuffer =`
	` +
	"void" + " Set" + variableNameUp  + `(` + typeName + ` val)
	{
		` + variableName + ` = val; 
	}
	`;

	return setterBuffer;
}
