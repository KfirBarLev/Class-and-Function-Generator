import * as vscode from 'vscode';
import * as utils from './utils';

export async function generateEqualityOperator()
{
	var classMembers = await optionBoxForClassMembers();
	if (!classMembers)
    {
        return;
    }
	
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
    var wherePutTheCode: string = putCodeAt.label;
	var names: string = equalityOperatorText("inline" === putCodeAt.label);
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
	
	editor.edit(edit => edit.insert(document.lineAt(line).range.end, names));
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
				
			//variableType = selectedText.split(' ')[0];
			//variableName = selectedText.split(' ')[1];	

			//classMembersName.push(variableName.trim());
			//variableType.trim();
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

function equalityOperatorText(isInline: boolean)
{
	
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';

	if(!isInline)
	{
// 	clasName =  getClassName();
// 	clasName += "::";
	
// 	defenitionText =`
// 	` +
// 	typeName + " Get" + variableNameUp  + `();
// 	`; 

// implementationText =`
// ` +
// typeName + " " + clasName + "Get" + variableNameUp  + `()
// {
// 	return ` + variableName + `;
// }
// `;
	}
	else
	{

	implementationText =`
	` +
	"bool operator==(const " + utils.getClassName() + "&other) const" + `
	{
	` + equalityMembersText() + `
	}

	`
	+ `bool operator!=(const ` + utils.getClassName() +` &other) const { return !(*this == other); }
	`
	;
	}   
     
	// let textArray: string[] = [];
	// textArray[0] = implementationText;
	// textArray[1] = defenitionText;

	//return textArray;
	return implementationText;

}


function equalityMembersText()
{
	var membersNames: string[] = getAllClassMembersWithType();
	var text: string = '';
	for (var member of membersNames)
	{
		var variableName: string = member.split(' ')[1].trim();
		if (member === membersNames[0])
		{
			text += "	return " + variableName + " == " + "other." + variableName;
		}
		else
		{
			text += "\n			&& " + variableName + " == " + "other." + variableName;
		}

		if (member === membersNames[membersNames.length - 1])
		{
			text += ";";
		}
	}

	return text;
}

function optionBoxForClassMembers()
{
	let items: vscode.QuickPickItem[] = [];
	var members: string[] = getAllClassMembersWithType();
	var button: vscode.QuickInputButton[] = [];
	for (let index = 0; index < members.length; index++) 
	{
		var variableType: string = members[index].split(' ')[0].trim();
		var variableName: string = members[index].split(' ')[1].trim();	

		items.push({ label: variableName, description: variableType,
			 picked: true, alwaysShow: true, buttons: button });
		
	}	

	var option: vscode.QuickPickOptions = 
	{
        title: "choose which class members include in the equality operators",        	
		canPickMany: true	
	};

	return vscode.window.showQuickPick(items, option).then(selection => 
	{
		// the user canceled the selection
		if (!selection) 
		{
			return;
		}
		else
		{
			return selection;
		}
	});
}
