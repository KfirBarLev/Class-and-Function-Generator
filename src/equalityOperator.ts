import * as vscode from 'vscode';
import * as utils from './utils';
import * as fs from 'fs';

export async function generateEqualityOperator()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] = await equalityOperatorText("inline" === putCodeAt.label);
	var line  = utils.getPositionForNewFunction();
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
	
	switch (putCodeAt.label)
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
				var endLine: number = utils.getPositionForNewFunction(true);
				await editor.edit(edit => edit.insert(document.lineAt(endLine).range.end, text[0]));
				break;	
		}
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
			let selectedText: string/* variableType: string, variableName: string*/;

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

async function equalityOperatorText(isInline: boolean)
{	
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';

	if(!isInline)
	{
	clasName =  utils.getClassName();
	
	
	defenitionText =`
	` +
	"bool operator==(const " + clasName + " &other) const;\n" + 
	"    bool operator!=(const " + clasName + " &other) const;\n"
	; 

implementationText =`
` +
"bool " + clasName + "::operator==(const " + clasName + " &other) const" + `
{
` + await equalityMembersText() + `
}

`
+ `bool ` + clasName + "::" + `operator!=(const ` + clasName +` &other) const  
{ 
	return !(*this == other); 
}
`
;
	}
	else
	{

	implementationText =`
	` +
	"bool operator==(const " + utils.getClassName() + "&other) const" + `
	{
	` + await equalityMembersText(true) + `
	}

	`
	+ `bool operator!=(const ` + utils.getClassName() +` &other) const { return !(*this == other); }
	`
	;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}


async function equalityMembersText(isInline: boolean = false)
{
	var tab: string = "";
	if (isInline)
	{
		tab = "    ";
	}
	
	var membersNames = await optionBoxForClassMembers();

	if (!membersNames)
	{
		return;
	}

	var text: string = '';
	for (var member of membersNames)
	{
		if (member === membersNames[0])
		{
			text += "    return " + member + " == " + "other." + member;
		}
		else
		{
			text += "\n" + tab + "		&& " + member + " == " + "other." + member;
		}

		if (member === membersNames[membersNames.length - 1])
		{
			text += ";";
		}
	}

	return text;
}

async function optionBoxForClassMembers()
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
