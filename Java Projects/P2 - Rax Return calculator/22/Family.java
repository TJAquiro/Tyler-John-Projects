public class Family
{
	private byte numMembers;
	private byte filingStatus;
	private Person[] members;
	private Taxation taxation = new Taxation();
	
	public Family(byte numMembersnum, byte filingStatus)
	{
		this.members = new Person[numMembersnum];
		this.filingStatus = filingStatus;
	}
	
	public void addMember(Person person)
	{
		Person[] returnArray = new Person[members.length + 1];
		
		for(int x = 0;x < members.length; ++x)
		{
			returnArray[x] = members[x];
		}
		
		returnArray[members.length] = person;
		
		members = returnArray;
	}
	
	
	public Person[] getMembers()
	{
		return members;
	}
	
	public byte getNumAdults()
	{
		byte counter = 0;
		for(int x = 0;x < members.length; ++x)
		{
			if (members[x] instanceof Adult)
			{
				++counter;
			}
		}
		return counter;
	}
	
	public byte getNumChildren()
	{
		byte counter = 0;
		for(int x = 0;x < members.length; ++x)
		{
			if (members[x] instanceof Child)
			{
				++counter;
			}
		}
		return counter;
	}
	
	public byte getFilingStatus()
	{
		return filingStatus;
	}
	
	public float getTaxableIncome()
	{
		float total = 0;
		
		for(int x = 0;x < members.length; ++x)
		{
			if (members[x] instanceof Adult)
			{
				total = total + ((Adult)members[x]).adjustedIncome() - members[x].deduction(this); //total = total + ((Adult)members[x]).adjustedIncome() - AdultDeduction((Adult)(members[x]), getNumAdults());
			}
		}
		
		for(int y = 0;y < members.length; ++y)
		{
			if (members[y] instanceof Child)
			{
				total = total + members[y].getGrossIncome() - members[y].deduction(this); //total = total + members[y].getGrossIncome() - childDeduction((Child)(members[y]), getNumChildren());
			}
		}
		return (Math.round(total*100.0f)/100.0f);
	}
	
	public float taxCredit()
	{
		float credit = 0;
		
		if (getTaxableIncome() <= (taxation.getMedianIncomePerCapita() * (float)0.5))
		{
			credit = credit + (float)(((int)(getTaxableIncome() / 1000)) * 30);
			
			for(int x = 0;x < members.length; ++x)
			{
				if (members[x] instanceof Child)
				{
					if (((Child)members[x]).getTuition() > 1000)
					{
						credit = credit + 1000;
					}
					else
					{
						credit = credit + ((Child)members[x]).getTuition();
					}
				}
			}
			if (filingStatus == 3)
			{
				credit = credit / (float)2;
			}
		}
		if (credit > 2000)
		{
			return (float)2000;
		}
		else
		{
			return (Math.round(credit*100.0f)/100.0f);
		}
	}
	
	public float calculateTax()
	{
		float totalWithheld = 0;
		Person[] familyMembers = this.getMembers();
			
		for(int x = 0;x < familyMembers.length; ++x)
		{
			if (familyMembers[x] instanceof Adult)
			{
					totalWithheld = totalWithheld + ((Adult)familyMembers[x]).taxWithheld();
			}
		}
		
		float k = ((taxation.amountTakenFromBrakets(this) - taxCredit()) - totalWithheld);
		
		return (Math.round(k*100.0f)/100.0f);
		
	}
}