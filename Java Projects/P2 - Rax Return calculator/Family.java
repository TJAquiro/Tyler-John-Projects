public class Family
{
	/**
	* @param numMembers - number if person objects in the family
	* @param filingStatus - can be 1 (single),2 (married filing jointly), or 3 (married filing separately)
	* @param members - an array of persons, made of family members
	* @param familyIndexer - used to help add members to the family
	*/
	
	private byte numMembers;
	private byte filingStatus;
	private Person[] members = new Person[0];
	private Taxation taxation = new Taxation();
	private int familyIndexer = 0;
	
	/**
	* This is the constructor for the Family object
	* Used to set numMembersnum, filingStatus
	*/
	
	public Family(byte numMembersnum, byte filingStatus)
	{
		this.members = new Person[numMembersnum];
		this.filingStatus = filingStatus;
	}
	
	//@addMember a person object is passed in and is added to members array
	
	public void addMember(Person person)
	{	
		members[familyIndexer] = person;
		++familyIndexer;
	}
	
	//@getMembers getter for members array
	
	public Person[] getMembers()
	{
		return members;
	}
	
	//@getNumAdults counts number of adult objects
	
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
	
	//@getNumChildren counts number of Child objects
	
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
	
	//@getFilingStatus getter for filingStatus
	
	public byte getFilingStatus()
	{
		return filingStatus;
	}
	
	/**
	* 
	* @getTaxableIncome return total Taxable Income of everyone in the family
	* uses adjustedIncome of adults minus deductions and
	* uses getGrossIncome of Child minus deductions and
	* all of these calulations are totaled and returned
	*/
	
	public float getTaxableIncome()
	{
		float total = 0;
		
		for(int x = 0;x < members.length; ++x)
		{
			if (members[x] instanceof Adult)
			{
				total = total + ((Adult)members[x]).adjustedIncome() - ((Adult)members[x]).deduction(this); //total = total + ((Adult)members[x]).adjustedIncome() - AdultDeduction((Adult)(members[x]), getNumAdults());
			}
		}
		
		for(int y = 0;y < members.length; ++y)
		{
			if (members[y] instanceof Child)
			{
				total = total + ((Child)members[y]).getGrossIncome() - ((Child)members[y]).deduction(this); //total = total + members[y].getGrossIncome() - childDeduction((Child)(members[y]), getNumChildren());
			}
		}
		return (Math.round(total*100.0f)/100.0f);
	}
	
	/**
	* 
	* @taxCredit if family in the bottom 50% of those below the medianIncomePerCapita
	* Adults and children get credit towards taxes 
	*
	*/
	
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
			credit = (float)2000;
		}
		
		if (taxation.amountTakenFromBrakets(this) < credit)
		{
			credit = taxation.amountTakenFromBrakets(this);
		}
		return (Math.round(credit*100.0f)/100.0f);
	}
	
	/**
	* 
	* @calculateTax uses tax brakets to calculate Tax of the family
	* subracting tax Credit and total Withheld
	*
	*/
	
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