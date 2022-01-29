// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

async function createNameInput()
{
	var option: vscode.InputBoxOptions = 
	{
		ignoreFocusOut: false,
		placeHolder: "Type your class name.",
		prompt: "Type your class name"
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

function hppText(name: string)
{
	//var className = name[0].toUpperCase() + name.substring(1); // case we want to be sure first letter is big rest small

	var className = name;
	const ifndefHead = 
	`#ifndef `+name.toUpperCase()+`_HPP
#define `+name.toUpperCase()+`_HPP`;

const defaultInfo = `

class ` + className +`  
{	
	public:
		`+ className +`();
		~`+className+`();

	private:

};`;

	const ifndefEnd= `

#endif // `+name.toUpperCase()+`_HPP
`;

	return ifndefHead + defaultInfo + ifndefEnd;			
}

function cppText(name: string)
{
	//var className = name[0].toUpperCase() + name.substring(1); // case we want to be sure first letter is big rest small

	var className = name;
	var hppName = name + ".hpp";
	var cppBuffer =
	`#include "` + hppName + `"  
		
`+className+`::`+ className +`()
{
	
}
	
`+className+`::~`+ className + `()
{
	
}
`;

	return cppBuffer;
}

function createFile(name: string, dir: string, type: string)
{
	if ("cpp" === type)
	{
		var cppBuffer = cppText(name);
		var cppName = dir + "\\" + name + '.cpp';
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
		var hppBuffer = hppText(name);
		var hppName = dir + "\\" + name + ".hpp";
		fs.writeFile(hppName, hppBuffer, function (err)
		{
			if (err) {
				console.error(err);
				return false;
			}
		});

	}
	

	return true;
}

function createClass(name: string, dir: string)
{
	
	var hppFile = createFile(name, dir, "hpp");
	var cppFile = createFile(name, dir, "cpp");

	return (hppFile && cppFile);
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "class-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('class-generator.CreateClass', async (args) => {

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
		} // check for class name

		//res = res.toLowerCase(); // case we want only lower case file name

		let dir :string ; //vscode.workspace.getConfiguration().get("cpp.creator.setPath");
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
					//If it's not a directory then it's the file so get the parent directory
					dir = path.dirname(args._fsPath);
				}
			}
		}
		else // case user not chose any dir/path
		{
			dir = vscode.workspace.rootPath as string; // use workspace path
		}

		var out = createClass(res as string, dir as string); 

		// Display a message box to the user
		if (out)
		{
			vscode.window.showInformationMessage(res + " Class create successfuly! in Path: " + dir);
		}
		else
		{
			vscode.window.showInformationMessage(res + " Class not created!");
		}
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
