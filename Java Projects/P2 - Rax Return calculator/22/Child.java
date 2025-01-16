public class Child extends Person
{
	protected String school;
	protected float tuition;
	private Taxation taxation = new Taxation();
	
	public Child(String name, String birthday, String ssn, float grossIncome, String school, float tuition)
	{
		super.Person();
		this.name = name;
		this.birthday = birthday;
		this.ssn = ssn;
		this.grossIncome = grossIncome;
		this.school = school;
		this.tuition = tuition;
	}
	
	public String toString()
	{
		return (name + " " + "xxx-xx-" + ssn.substring(7,11) + " " + birthday.substring(0,4) + "/**/**" + " " + school);
	}
	
	public float getTuition()
	{
		return (Math.round(tuition*100.0f)/100.0f);
	}
	
	public float getGrossIncome()
	{
		return (Math.round(grossIncome*100.0f)/100.0f);
	}
	
	public float deduction(Family family)
	{
		float deductionAmount = taxation.getChildBaseExemption();
		
		if (family.getNumChildren() > 10)
		{
			deductionAmount = deductionAmount - (deductionAmount * (float)0.5);
		}
		else if (family.getNumChildren() > 2)
		{
			deductionAmount = deductionAmount - (deductionAmount * ((float)0.05 * (family.getNumChildren() - 2)));
		}
		
		if (deductionAmount > getGrossIncome())
		{
			deductionAmount = getGrossIncome();
		}
		
		return (Math.round(deductionAmount*100.0f)/100.0f);
	}
	
}