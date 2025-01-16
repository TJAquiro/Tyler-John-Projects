public class TaxYear
{
	private int maxNumReturns;
	public Family[] filedFamilies = new Family[0];
	private Taxation taxation = new Taxation();
	
	
	public TaxYear(int max)
	{
		maxNumReturns = max;
	}
	
	public boolean taxFiling(Family family)
	{
		if ((family.getNumAdults() == 0) || ((family.getNumAdults() == 1) && (family.getFilingStatus() == 2)) || ((family.getNumAdults() > 1) && (family.getFilingStatus() == 1)))
		{
			return false;
		}
		else
		{
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
					System.out.println(((Adult)familyMembers[x]).taxWithheld());
					
					totalWithheld = totalWithheld + ((Adult)familyMembers[x]).taxWithheld();
				}
			}
			
		}
		return (Math.round(totalWithheld*100.0f)/100.0f);
	}
	
	
	public float taxOwed() 
	{
		float totalTaxOwed = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			
			totalTaxOwed = totalTaxOwed + taxation.amountTakenFromBrakets(filedFamilies[family]);
		}
		
		return (Math.round(totalTaxOwed*100.0f)/100.0f);
	}
	
	public float taxDue()
	{
		float totalTaxDue = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			
			
			totalTaxDue = totalTaxDue + filedFamilies[family].calculateTax();
		}
		
		return (Math.round(totalTaxDue*100.0f)/100.0f);
	}
	
	public float taxCredits() 
	{
		float totalTaxCredits = 0;
		
		for(int family = 0;family < filedFamilies.length; ++family)
		{
			totalTaxCredits = totalTaxCredits + filedFamilies[family].taxCredit();
		}
		
		return (Math.round(totalTaxCredits*100.0f)/100.0f);
	}
	
	public int numberOfReturnsFiled()
	{
		return filedFamilies.length;
	}
	
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
	
	public Family getTaxReturn(int index)
	{
		return filedFamilies[index];
	}
	
	public Family[] getFiledFamilies()
	{
		return filedFamilies;
	}
	
	
	public int familyRank(Family family)
	{
		return 1;
	}
}