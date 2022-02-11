import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as file from './classAndFileCreation';


export async function generateClassAndfiles(args: any, classCreate: boolean, fileType: string)
{
		// The code you place here will be executed every time your command is executed
		var res = await file.createNameInput();

		if (res === undefined)
		{
			vscode.window.showErrorMessage("Your Class could not be created!");
			return;
		}

		if(!file.canContinue(res))
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

		var out = file.createClass(res as unknown as string, dir as string, classCreate, fileType); 

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


export function createNameInput()
{
	var option: vscode.InputBoxOptions = 
	{
		ignoreFocusOut: false,
		placeHolder: "Type your class or file name.",
		prompt: "Type your class or file name."
	};

	return vscode.window.showInputBox(option);
}


export function canContinue(res: any)
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

export function hppText(name: string, createClass: boolean)
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

export function cppText(name: string, createClass: boolean)
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

export function createFile(name: string, dir: string, type: string, createClass: boolean)
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

export function createClass(name: string, dir: string, classCreate: boolean, fileType: string)
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
