import * as vscode from 'vscode';

export async function generateEqualityOperator()
{
    var answer = await optionBoxs(); // for where to put the code (inline/soure/header)
    if (!answer)
    {
        return;
    }

    var wherePutTheCode: string = answer.label;
    vscode.window.showInformationMessage("wherePutTheCode: " + wherePutTheCode);
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