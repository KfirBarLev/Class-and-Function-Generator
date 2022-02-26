import * as utils from './utils';

export async function generateEqualityOperator()
{
    var putCodeAt = await utils.optionBoxsForWherePutTheCode();
    if (!putCodeAt)
    {
        return;
    }
	
	var text: string[] | undefined = await equalityOperatorText("inline" === putCodeAt.label);
	if (!text)
    {
        return;
    }
	
	utils.insertText(text, putCodeAt.label);
}


async function equalityOperatorText(isInline: boolean)
{	
    var clasName: string = '';
	var defenitionText = '';
	var implementationText = '';

	
	
	if(!isInline)
	{
		clasName =  utils.getClassName();
		let membersText = await equalityMembersText();
		if (!membersText)
		{
			return;
		}
	
	defenitionText =`
	` +
	"bool operator==(const " + clasName + " &other) const;\n" + 
	"    bool operator!=(const " + clasName + " &other) const;\n"
	; 

implementationText =`
` +
"bool " + clasName + "::operator==(const " + clasName + " &other) const" + `
{
` + membersText + `
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
		let membersText = await equalityMembersText(true);
		if (!membersText)
		{
			return;
		}

	implementationText =`
	` +
	"bool operator==(const " + utils.getClassName() + "&other) const" + `
	{
	` + membersText + `
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
	
	var membersNames = await utils.optionBoxForClassMembers();

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

