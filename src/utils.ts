import * as vscode from 'vscode';
import * as fs from 'fs';

export function getPositionForNewFunction(location: string = "") : number // location = header end/includes/else is deafult
{
	var line: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return 0;
	}

	let i: number = 0;
	line = editor.document.lineAt(i);

	switch(location)
	{
		case "header end":
			while (!line.text.includes("endif"))
			{
				i++;
				line = editor.document.lineAt(i);
			}

			return --i;

		case "includes":
			while (!line.text.includes("#define"))
			{
				i++;
				line = editor.document.lineAt(i);
			}

			return ++i;

		default:
			while (!line.text.includes("private:") && "};" !== line.text )
			{
				i++;
				line = editor.document.lineAt(i);
			}

			return --i;
	}
}


export function getClassName() : string
{
	var lineText: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return '';
	}

	var i: number = editor.selection.active.line;
	lineText = editor.document.lineAt(i);
	
	while (!lineText.text.includes("class") && 0 !== i)
	{
		i--;
		lineText = editor.document.lineAt(i);
	}

	let className = lineText.text.split(' ');

	return className[1];	 
}

export function optionBoxsForWherePutTheCode()
{
	var option: vscode.QuickPickOptions = 
	{
        title: "choose where to put the implementaion"        	
		//canPickMany: true	
	};

	return vscode.window.showQuickPick(
		[
			{label: "inline", description: "implemntaion in header class"}, 
			{label: "suorce file", description: "decleration in header, implemntaion in source"}, 
			{label: "header file", description: "decleration and implemntaion in header"}
		], option);
}

export async function insertText(text: string[], location: string) // location = inline/suorce file/header file
{
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return;
	}
	
	const document = editor.document;
	
	// case add includes to add
	if (text.length === 3)
	{
		var includeline: number = getPositionForNewFunction("includes");
		await editor.edit(edit => edit.insert(document.lineAt(includeline).range.end, text[2]));
	}

	var line  = getPositionForNewFunction();
	if (!line) 
	{
		vscode.window.showErrorMessage('getPositionForNewFunction(); faild!');
		return;
	}

	switch (location)
	{
		case "inline":
			editor.edit(edit => edit.insert(document.lineAt(line).range.end, text[0]));
			break;
		case "suorce file":
			// write implemention in source file
			var sourceName = document.fileName.replace("hpp", "cpp");
			fs.appendFile(sourceName, text[0], function (err)
			{
				if (err) 
				{
					console.error(err);
					return false;
				}
			});
			// put defenition on header 
			editor.edit(edit => edit.insert(document.lineAt(line).range.end, text[1]));
			break;
		case "header file":
			// put defenition on header
			await editor.edit(edit => edit.insert(document.lineAt(line).range.end, text[1]));
			var endLine: number = getPositionForNewFunction("header end");
			await editor.edit(edit => edit.insert(document.lineAt(endLine).range.end, text[0]));
			break;	
	}
}


export async function optionBoxForClassMembers() 
{
	let items: vscode.QuickPickItem[] = [];
	var members: string[] = getAllClassMembersWithType();
	
	for (let index = 0; index < members.length; index++) 
	{
		var variableType: string = members[index].split(' ')[0].trim();
		var variableName: string = members[index].split(' ')[1].trim();
		
		if (variableName[0] === '*' || variableName[0] === '&')
		{
			variableType += variableName[0];
			variableName = variableName.replace(variableName[0], "").trim();
		}

		items.push({ label: variableName, description: variableType,picked: true});	
	}	
	
	const selection = await vscode.window.showQuickPick(items, 
		{title: "choose which class members include in the equality operators", 
		canPickMany: true	
	 });

	if (!selection)
	{
		return;
	}

	var pickedMembers: string[] = [];

	for (let index = 0; index < selection.length; index++)
	{
		pickedMembers.push(selection[index].label);
	} 				

	return pickedMembers;
}



function getAllClassMembersWithType()
{
	var lineText: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return [];
	}

	var lineNumber: number = getTheLineWhereTheClassStart();

	lineText = editor.document.lineAt(lineNumber);
	var classMembersName: string[] = [];
	
	while (!lineText.text.includes("};")) // while not in the end of the class
	{
		if (lineText.text.includes("m_") || lineText.text.includes("s_"))
		{
			let selectedText: string;

			selectedText = lineText.text.replace(';', '').trim(); //removes all semicolons 
				
			classMembersName.push(selectedText.trim());
		}

		lineNumber++;
		lineText = editor.document.lineAt(lineNumber);
	}

	return classMembersName;	 		
}

function getTheLineWhereTheClassStart()
{
	var lineText: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return -1;
	}

	var i: number = editor.selection.active.line;
	lineText = editor.document.lineAt(i);
	
	while (!lineText.text.includes("class") && 0 !== i)
	{
		i--;
		lineText = editor.document.lineAt(i);
	}

	return i;	 		
}


