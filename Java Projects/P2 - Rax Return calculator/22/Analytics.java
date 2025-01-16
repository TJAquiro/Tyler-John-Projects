public class Analytics
{
	public float povertyThreshold = 27750.0f;
	public TaxYear year;
	
	public Analytics(TaxYear year)
	{
		this.year = year;
	}
	
	public void setPovertyThreshold(float povertyThreshold)
	{
		this.povertyThreshold = povertyThreshold;
	}
	
	public float averageFamilyIncome()
	{
		Family[] filedFams = year.getFiledFamilies();
		
		float counter = 0;
		float adder = 0;
		
		for(int x = 0;x < filedFams.length; ++x)
		{
			adder = adder + filedFams[x].getTaxableIncome();
			++counter;
		}
		
		if (counter > 0)
		{
			adder = (adder / counter);
		}
		
		return (Math.round(adder*100.0f)/100.0f);
	}
	
	public float averagePersonIncome()
	{
		Family[] filedFams = year.getFiledFamilies();
		
		float taxableIncome = 0;
		float pplAmount = 0;
		
		for(int x = 0;x < filedFams.length; ++x)
		{	
			taxableIncome = taxableIncome + filedFams[x].getTaxableIncome();
			pplAmount = pplAmount + (filedFams[x].getMembers()).length;
		}
		
		float k = (taxableIncome / pplAmount);
		
		return (Math.round(k*100.0f)/100.0f);
	}
	
	public float maxFamilyIncome()
	{
		Family[] filedFams = year.getFiledFamilies();
		
		float maxtaxableIncome = 0;
		
		for(int x = 0;x < filedFams.length; ++x)
		{	
			if (filedFams[x].getTaxableIncome() > maxtaxableIncome)
			{
				maxtaxableIncome = filedFams[x].getTaxableIncome();
			}
		}
		return (Math.round(maxtaxableIncome*100.0f)/100.0f);
	}
	
	public float maxPersonIncome()
	{
		Family[] filedFams = year.getFiledFamilies();
		
		float maxPersonalTaxableIncome = 0;
		
		for(int x = 0;x < filedFams.length; ++x)
		{	
			Person[] ppl = filedFams[x].getMembers();
				
			for(int i = 0;i < ppl.length; ++i)
			{	
				if (ppl[i] instanceof Adult)
				{
					if (((Adult)ppl[i]).adjustedIncome() - ppl[i].deduction(filedFams[x]) > maxPersonalTaxableIncome)
					{
						maxPersonalTaxableIncome = ((Adult)ppl[i]).adjustedIncome() - ppl[i].deduction(filedFams[x]);
					}
					
				}
			}
		}
		return (Math.round(maxPersonalTaxableIncome*100.0f)/100.0f);
	}
	
	public int familiesBelowPovertyLimit()
	{
		Family[] filedFams = year.getFiledFamilies();
		
		int counter = 0;
		
		for(int x = 0;x < filedFams.length; ++x)
		{	
			if (filedFams[x].getTaxableIncome() < povertyThreshold)
			{
				++counter;
			}
		}
		return counter;
	}
}
