import * as vscode from 'vscode';
import * as fs from 'fs';

export function getPositionForNewFunction(impInHeader: boolean = false) : number
{
	var line: vscode.TextLine;
	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return 0;
	}

	var i: number = 0;
	line = editor.document.lineAt(i);

	if (impInHeader)
	{
		while (!line.text.includes("endif"))
		{
			i++;
			line = editor.document.lineAt(i);
		}
	}
	else
	{
		while (!line.text.includes("private:") && "};" !== line.text )
		{
			i++;
			line = editor.document.lineAt(i);
		}
	}	

	return --i;	 
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

export async function insertText(text: string[], location: string)
{
	var line  = getPositionForNewFunction();
	if (!line) 
	{
		vscode.window.showErrorMessage('getPositionForNewFunction(); faild!');
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (!editor) 
	{
		return;
	}
	
	const document = editor.document;
	
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
			var endLine: number = getPositionForNewFunction(true);
			await editor.edit(edit => edit.insert(document.lineAt(endLine).range.end, text[0]));
			break;	
	}
}


