import * as vscode from 'vscode';
import * as utils from './utils';

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
		var answer = await utils.optionBoxsForWherePutTheCode();
		if (!answer)
		{
			return;
		}

		var isInline: boolean = (answer.label === "inline");

		let codeText = generateGetterSetterAutomatically(textLine.text, funcName, isInline);
		if (!codeText) 
		{
			vscode.window.showErrorMessage('generate Getter Setter Automatically faild!');
			return;
		}
		
		utils.insertText(codeText, answer.label);
		
		vscode.window.showInformationMessage(funcName + " successfully created! " + answer.label);
	}
	else
	{
		vscode.window.showErrorMessage('Nothing was selected!');
	}
	
}

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


function getterText(typeName: string, variableName: string, isInline: boolean)
{
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 

	if(!isInline)
	{
	clasName =  utils.getClassName();
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
	var implementationText = '';

	if(!isInline)
	{
		clasName =  utils.getClassName();
		clasName += "::";
		
	defenitionText =`
	` +
	"void" + " Set" + variableNameUp  + `(` + typeName + ` val);
	`; 
implementationText =`
` +
"void" + " " + clasName + "Set" + variableNameUp  + `(` + typeName + ` val)
{
	` + variableName + ` = val; 
}
`;
	}
	else
	{
	implementationText =`
	` +
	"void" + " Set" + variableNameUp  + `(` + typeName + ` val)
	{
		` + variableName + ` = val; 
	}
	`;
	}

	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}
