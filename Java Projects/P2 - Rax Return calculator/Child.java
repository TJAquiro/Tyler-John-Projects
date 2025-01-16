/**
*
* The Child class, sub-object of Person
*
* @author  Tyler John Aquiro
* @version 1.0
*
*/

public class Child extends Person
{
	/**
	* @param school - school of Child
	* @param tuition - tuition cost
	* @param name - the name of the person object
	* @param birthday - birthday of the object, in YYYY/MM/DD format
	* @param ssn - nine-digit SSN in xxx-xx-xxxx format
	* @param grossIncome - The gross income of a person
	* @param taxation - A Taxation object used to get data from the taxation class
	*/
	
	private String school;
	private float tuition;
	private String name;
	private String birthday;
	private String ssn;
	private float grossIncome;
	private Taxation taxation = new Taxation();
	
	/**
	* This is the constructor for the Child object
	* Used to set id, name, birthday, ssn, grossIncome, school, tuition
	*/
	
	public Child(String name, String birthday, String ssn, float grossIncome, String school, float tuition)
	{
		super();
		this.birthday = birthday;
		this.ssn = ssn;
		this.grossIncome = grossIncome;
		this.school = school;
		this.tuition = tuition;
	}
	
	//@toString turns the object and it's fields into a readable string
	
	public String toString()
	{
		return (name + " " + "xxx-xx-" + ssn.substring(7,11) + " " + birthday.substring(0,4) + "/**/**" + " " + school);
	}
	
	//@getTuition getter for tuition field
	
	public float getTuition()
	{
		return (Math.round(tuition*100.0f)/100.0f);
	}
	
	//@getGrossIncome getter for grossIncome field
	
	public float getGrossIncome()
	{
		return (Math.round(grossIncome*100.0f)/100.0f);
	}
	
	/**
	* @override parent method
	* @taxWithheld Returns the amount of Gross Income that is exempted from taxation
	*/
	
	public float deduction(Family family)
	{
		float deductionAmount = taxation.getChildBaseExemption();
		
		if (family.getNumChildren() > 12)
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