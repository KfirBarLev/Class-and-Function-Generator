import * as vscode from 'vscode';

export async function generateEqualityOperator()
{
    var answer = await optionBoxs(); // for where to put the code (inline/soure/header)
    if (!answer)
    {
        return;
    }

    var wherePutTheCode: string = answer.label;
	var names: string = equalityOperatorText(true);
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
	
	editor.edit(edit => edit.insert(document.lineAt(line).range.end, names));
}

function optionBoxs()
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

function getAllClassMembers()
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
			let selectedText,/* variableType: string,*/ variableName: string;

			selectedText = lineText.text.replace(';', '').trim(); //removes all semicolons 
				
			//variableType = selectedText.split(' ')[0];
			variableName = selectedText.split(' ')[1];	

			classMembersName.push(variableName.trim());
			//variableType.trim();
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
	"bool operator==(const " + getClassName() + "&other) const" + `
	{
	` + equalityMembersText() + `
	}
	
	`
	+ `bool operator!=(const ` + getClassName() +` &other) const { return !(*this == other); }
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
	var membersNames: string[] = getAllClassMembers();
	var text: string = '';
	for (var member of membersNames)
	{
		if (member === membersNames[0])
		{
			text += "	return " + member + " == " + "other." + member;
		}
		else
		{
			text += "\n			&& " + member + " == " + "other." + member;
		}

		if (member === membersNames[membersNames.length - 1])
		{
			text += ";";
		}
	}

	return text;
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
	
	// TODO: start the sereach for current line(where the membere), and go up until find class
	while (!line.text.includes("class") && "};" !== line.text )
	{
		i++;
		line = editor.document.lineAt(i);
	}

	let className = line.text.split(' ');

	return className[1];	 
}

function getPositionForNewFunction(impInHeader: boolean = false) : number
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

