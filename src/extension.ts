// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "class-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.CreateClass', 
												   async (args) => runCommand(args, true, "both")));
	
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.SourceFile', 
												   async (args) => runCommand(args, false, "cpp")));

    context.subscriptions.push(vscode.commands.registerCommand('class-generator.HeaderFile', 
												   async (args) => runCommand(args, false, "hpp")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.HeaderAndSourceFiles', 
												   async (args) => runCommand(args, false, "both")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Getter', 
												   async (args) => printSelection("getter")));

	context.subscriptions.push(vscode.commands.registerCommand('class-generator.Setter', 
												   async (args) => printSelection("setter")));
												   											  		
	context.subscriptions.push(vscode.commands.registerCommand('class-generator.GetterAndSetter', 
												   async (args) => printSelection("both")));											   	   
}

async function createNameInput()
{
	var option: vscode.InputBoxOptions = 
	{
		ignoreFocusOut: false,
		placeHolder: "Type your class or file name.",
		prompt: "Type your class or file name."
	};

	return vscode.window.showInputBox(option);
}


function canContinue(res: any)
{
	if (res.length > 60)
	{
		vscode.window.showErrorMessage("Class name to long!");
		return false;
	}
	else if (res.indexOf(' ') >= 0)
	{
		vscode.window.showErrorMessage("Class name should not have spaces!");
		return false;
	}
	return true;
}

function hppText(name: string, createClass: boolean)
{
	var className = name;
	const ifndefHead = 
	`#ifndef `+name.toUpperCase()+`_HPP
#define `+name.toUpperCase()+`_HPP`;
var defaultInfo = '';

 if (createClass)
 {
 defaultInfo = `

class ` + className +`  
{	
	public:
		`+ className +`();
		~`+className+`();

	private:

};`;
 }
	const ifndefEnd= `

#endif // `+name.toUpperCase()+`_HPP
`;

	return ifndefHead + defaultInfo + ifndefEnd;			
}

function cppText(name: string, createClass: boolean)
{
	var className = name;
	var hppName = name + ".hpp";
	var cppBuffer = '';

	if (createClass)
	{
	cppBuffer =
	`#include "` + hppName + `"  
		
`+className+`::`+ className +`()
{
	
}
	
`+className+`::~`+ className + `()
{
	
}
`;
	}

	return cppBuffer;
}

function getterText(typeName: string, variableName: string)
{
	// remove the m_ prefix and make first char upper case
	let variableNameUp = variableName.charAt(2).toUpperCase() + variableName.slice(3); 

	var getterBuffer = '';

	getterBuffer =`
	` +
	typeName + " Get" + variableNameUp  + `()
	{
		return ` + variableName + `;
	}
	`;

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

function createFile(name: string, dir: string, type: string, createClass: boolean)
{
	var cppName = dir + "\\" + name + '.cpp';
	if ("cpp" === type)
	{
		var cppBuffer = cppText(name, createClass);		
		fs.writeFile(cppName, cppBuffer, function (err)
		{
			if (err) 
			{
				console.error(err);
				return false;
			}
		});
	}
	else
	{
		var hppBuffer = hppText(name, createClass);
		var hppName = dir + "\\" + name + ".hpp";
		fs.writeFile(hppName, hppBuffer, function (err)
		{
			if (err) {
				console.error(err);
				return false;
			}
		});

		if ("both" === type)
		{
	cppBuffer =
	`#include "` + name + ".hpp" + `"  `;	
		fs.writeFile(cppName, cppBuffer, function (err)
		{
			if (err) {
				console.error(err);
				return false;
			}
		});
		}
	}
	
	return true;
}

function createClass(name: string, dir: string, classCreate: boolean, fileType: string)
{
	switch(fileType)
	{
		case "hpp":
			var hppFile = createFile(name, dir, "hpp", classCreate);
			return hppFile;
		case "cpp":
			var cppFile = createFile(name, dir, "cpp", classCreate);
			return cppFile;
		case "both":
			var hppFile = createFile(name, dir, "both", classCreate);
			var cppFile = createFile(name, dir, "cpp", classCreate);
			return (hppFile && cppFile);
	}	
}

async function runCommand(args: any, classCreate: boolean, fileType: string)
{
		// The code you place here will be executed every time your command is executed
		var res = await createNameInput();

		if (res === undefined)
		{
			vscode.window.showErrorMessage("Your Class could not be created!");
			return;
		}

		if(!canContinue(res))
		{ 
			return;
		} // check for class or file name

		let dir :string ;
		// If it's called via the context menu, it's gonna have the _fsPath set from where you're clicking
		// eslint-disable-next-line eqeqeq
		if (args != null && args._fsPath != null) 
		{
			dir = args._fsPath;
			if (typeof dir === "string" && fs.existsSync(dir)) 
			{
				var stats = fs.lstatSync(dir);

				if (!stats.isDirectory()) 
				{
					//If it's not a directory then it's file, so get the parent directory
					dir = path.dirname(args._fsPath);
				}
			}
		}
		else // case user not chose any dir/path
		{
			dir = vscode.workspace.rootPath as string; // use workspace path
		}

		var out = createClass(res as string, dir as string, classCreate, fileType); 

		// Display a message box to the user
		if (out)
		{
			vscode.window.showInformationMessage(res + " create successfuly! in Path: " + dir);
		}
		else
		{
			vscode.window.showInformationMessage(res + " not created!");
		}		
}

async function printSelection(funcName: string)
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
		let codeText = generateGetterSetterAutomatically(textLine.text, funcName);

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
	
		let generatedText: string = codeText;
		
		const document = editor.document;          
	
		editor.edit(edit => edit.insert(document.lineAt(line).range.end, generatedText));
		
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

function sleep(ms: number) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}


function generateGetterSetterAutomatically(text: any, func: string) // func="getter"/"setter"/"both"
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
		code = getterText(variableType, variableName) + setterText(variableType, variableName);		
	} 
	else if (func === "getter")
	{
		var answer = optionBoxs();

		vscode.window.showInformationMessage(answer as unknown as string);

		getter = getterText(variableType, variableName);
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

// this method is called when your extension is deactivated
export function deactivate() {}
