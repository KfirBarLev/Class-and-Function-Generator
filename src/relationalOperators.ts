import * as utils from './utils';
import * as vscode from 'vscode';

export async function generateRelationalOperator()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] | undefined = await relationalOperatorText("inline" === putCodeAt.label);
    if (!text)
    {
        return;
    }

	utils.insertText(text, putCodeAt.label);
}

async function relationalOperatorText(isInline: boolean = false)
{
    var clasName: string = utils.getClassName();
	var defenitionText = '';
	var implementationText = '';
	
	if(!isInline)
	{
		let membersText = await relationalMembersText();
		if (!membersText)
		{
			return;
		}
	
	defenitionText =`
	` +
	`bool operator<(const ` + clasName + ` &other) const;
	bool operator>(const ` + clasName + ` &other) const;
	bool operator<=(const ` + clasName + ` &other) const;
	bool operator>=(const ` + clasName + ` &other) const;
	`
	; 

implementationText =`
` +
"bool " + clasName + "::operator<(const BankAccount &other) const" + `
{` + membersText + `
}

` +
`bool ` + clasName + `::operator>(const ` + clasName + ` &other) const 
{
	return other < *this;
}

bool ` + clasName + `::operator<=(const ` + clasName + ` &other) const 
{
	return !(other < *this);
}

bool ` + clasName + `::operator>=(const ` + clasName + ` &other) const 
{
	return !(*this < other);
}

`
;
	}
	else
	{
		let membersText = await relationalMembersText(true);
		if (!membersText)
		{
			return;
		}
        
	implementationText =`
	` + 
	"bool operator<(const " + clasName + " &other) const" + `
	{` + membersText + `
	}
	` +
	`bool operator>(const ` + clasName + `&other) const { return other < *this; }
	bool operator<=(const ` + clasName +  ` &other) const { return !(other < *this); }
	bool operator>=(const ` + clasName  + ` &other) const { return !(*this < other); }
	`;
	}   
     
	let textArray: string[] = [];
	textArray[0] = implementationText;
	textArray[1] = defenitionText;

	return textArray;
}

async function relationalMembersText(isInline: boolean = false)
{
	var tab: string = "";
	if (isInline)
	{
		tab = "    ";
	}
	
	var membersNames = await utils.optionBoxForClassMembers();
	if (!membersNames)
	{
		return;
	}

	var text: string = '';
	for (var member of membersNames)
	{
		if (member === membersNames[membersNames.length - 1])
		{
			
            text += "\n" + tab +  "	return " + member + " < " + "other." + member + ";";
			break;
		}
		
		text += "\n" + tab +  "	if (" + member + " < " + "other." + member + ")" +
				"\n" + tab +  "		return true;" +
				"\n" + tab +  " 	if (other." + member + " < " + member + ")" +
				"\n" + tab +  "		return false;";    	
	}

	return text;
}