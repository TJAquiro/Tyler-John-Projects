public class TaxYear
{
	/**
	* @param maxNumReturns - max number of tax returns
	* @param filedFamilies - an array of valid Families that filed tax returns
	* @param taxation - A Taxation object used to get data from the taxation class
	*/
	
	private int maxNumReturns;
	private Family[] filedFamilies = new Family[0];
	private Taxation taxation = new Taxation();
	
	/**
	* This is the constructor for the TaxYear object
	* Used to set maxNumReturns
	*/
	
	public TaxYear(int max)
	{
		maxNumReturns = max;
	}
	
	//@taxFiling checks the validity of the family and if we aren't over maxNumReturns, if valid it is added to filedFamilies;
	
	public boolean taxFiling(Family family)
	{
		if ((family.getNumAdults() == 0) || ((family.getNumAdults() == 1) && (family.getFilingStatus() == 2)) || ((family.getNumAdults() > 1) && (family.getFilingStatus() == 1)))
		{
			return false;
		}
		else
		{
			if (filedFamilies.length >= maxNumReturns)
			{
				return false;
			}
			
			Family[] adderArray = new Family[filedFamilies.length + 1];
			
			for(int x = 0;x < filedFamilies.length; ++x)
			{
				adderArray[x] = filedFamilies[x];
			}
			
			adderArray[filedFamilies.length] = family;
			
			filedFamilies = adderArray;
			
			return true;
		}
	}
	
	//@taxWithheld calculates the total amount of tax Withheld of all filed families
	
	public float taxWithheld()
	{	
		float totalWithheld = 0;
		Person[] familyMembers;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			
			familyMembers = (filedFamilies[family]).getMembers();
			
			for(int x = 0;x < familyMembers.length; ++x)
			{
				if (familyMembers[x] instanceof Adult)
				{
					
					System.out.println("+"+((Adult)familyMembers[x]).taxWithheld());
					
					totalWithheld = totalWithheld + ((Adult)familyMembers[x]).taxWithheld();
				}
			}
			
		}
		
		return (Math.round(totalWithheld*100.0f)/100.0f);
	}
	
	//@taxOwed calculates the total amount of tax owed of all filed families
	
	public float taxOwed() 
	{
		
		float totalTaxOwed = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			totalTaxOwed = totalTaxOwed + taxation.amountTakenFromBrakets(filedFamilies[family]);
		}
		
		return (Math.round(totalTaxOwed*100.0f)/100.0f);
	}
	
	//@taxDue calculates the total amount of tax Due of all filed families
	
	public float taxDue()
	{
		
		float totalTaxDue = 0;
		Person[] familyMembers;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			
			totalTaxDue = totalTaxDue + filedFamilies[family].calculateTax();
		}
		
		return (Math.round(totalTaxDue*100.0f)/100.0f);
	}
	
	//@taxDue calculates the total amount of tax Due of all filed families
	
	public float taxCredits() 
	{
		
		float totalTaxCredits = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			totalTaxCredits = totalTaxCredits + filedFamilies[family].taxCredit();
			
		}
		
		return (Math.round(totalTaxCredits*100.0f)/100.0f);
		
	}
	
	//@numberOfReturnsFiled gets the number of families that filed
	
	public int numberOfReturnsFiled()
	{
		int counter = 0;
		
		for(int x = 0;x < filedFamilies.length; ++x)
		{
			if (filedFamilies[x] instanceof Family)
			{
				++counter;
			}
		}
		
		return counter;
	}
	
	//@numberOfPersonsFiled gets the number of people that filed
	
	public int numberOfPersonsFiled()
	{
		int personCounter = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			personCounter = personCounter + (filedFamilies[family].getNumAdults());
			personCounter = personCounter + (filedFamilies[family].getNumChildren());
		}
		
		return personCounter;
	}
	
	//@getTaxReturn gets the family at a certain index
	
	public Family getTaxReturn(int index)
	{
		return filedFamilies[index];
	}
	
	//@getTaxReturn getter for filedFamilies field
	
	public Family[] getFiledFamilies()
	{
		return filedFamilies;
	}
}