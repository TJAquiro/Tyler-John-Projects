public class Adult extends Person
{
	protected String employer;
	private Taxation taxation = new Taxation();
	
	public Adult(String name, String birthday, String ssn, float grossIncome, String employer)
	{
		super.Person();
		this.name = name;
		this.birthday = birthday;
		this.ssn = ssn;
		this.grossIncome = grossIncome;
		this.employer = employer;
	}
	
	public String toString()
	{
		return (name + " " + "xxx-xx-" + ssn.substring(7,11) + " " + birthday.substring(0,4) + "/**/**" + " $" + grossIncome);
	}
	
	public float adjustedIncome()
	{
		float mcTax = grossIncome * (taxation.getMedicareRate() / (float)(100));
		
		
		float ssTax;
		
		if (taxation.getSocialSecurityIncomeLimit() < grossIncome)
		{
			ssTax = taxation.getSocialSecurityIncomeLimit() * (taxation.getSocialSecurityRate() / (float)(100));
		}
		else
		{
			ssTax = grossIncome * (taxation.getSocialSecurityRate() / (float)(100));
		}
		
		float k = (grossIncome - (ssTax / 2 + mcTax / 2));
		
		return((float)Math.round(k*100.0f)/100.0f);
	}
	
	public float taxWithheld()
	{
		float withHeld = 0;
		
		if (grossIncome <= (float)50000.00)
		{
			withHeld = (grossIncome * (float)0.10);
		}
		else if (grossIncome <= (float)100000.00)
		{
			withHeld = ((float)50000.00 * (float)0.10) + ((grossIncome - (float)50000.00) * (float)0.15);
		}
		else if (grossIncome > (float)100000.00)
		{
			withHeld = ((float)50000.00 * (float)0.10) + ((float)50000.00 * (float)0.15) + ((grossIncome - (float)100000.00) * (float)0.2);
		}
		
		
		return((float)Math.round(withHeld*100.0f)/100.0f);
	}
	
	@Override
	public float deduction(Family family)
	{
		float deductionAmount = 0;
		if (family.getNumAdults() == 1)
		{
			deductionAmount = deductionAmount + 2 * taxation.getAdultBaseExemption();
		}
		else
		{
			deductionAmount = deductionAmount + taxation.getAdultBaseExemption();
		}
		if (adjustedIncome() > (float)100000.00)
		{
			float deductionDiscont = ((float)(((int)((adjustedIncome() - 100000) / 1000)) * (float)(0.005)));
			if (deductionDiscont <= 0.3)
			{
				deductionAmount = deductionAmount - (deductionAmount * deductionDiscont);
			}
			else
			{
				deductionAmount = deductionAmount - (deductionAmount * (float)0.3);
			}
		}
		
		if (deductionAmount > adjustedIncome())
		{
			deductionAmount = adjustedIncome();
		}
		
		return (Math.round(deductionAmount*100.0f)/100.0f);
	}
	
	public String getEmployer()
	{
		return employer;
	}
}