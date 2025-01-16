/**
*
* The Person program implements an application that
* 
*
* @author  Tyler John Aquiro
* @version 1.0
*
*/

public class Person
{
	protected String name;
	protected String birthday;
	protected String ssn;
	protected float grossIncome;
	protected static int id = 0;
	
	public void Person()
	{
		this.id = id + 1;
	}
	
	/**
    * 
    * @setName Checks if the name doesn't have any illegal characters before making the person's name
    * 
    */
	
	public boolean setName(String name)
	{
		String letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM ";
		
		for(int x = 0;x < name.length(); ++x)
        {
            if (!(letters.contains(name.substring(x,x+1))))
            {
				return false;
            }
        }
		this.name = name;
		
		return true;
	}
	
	/**
    * 
    * @setBirthday Sets the birthday varable taking in a string date making sure it works
    * 
    */
	
	public boolean setBirthday(String date)
	{
		String numbers = "1234567890";
		String slash = "/";
		
		if ((date.length() > 10) || !(slash.contains(date.substring(4,5))) || !(slash.contains(date.substring(7,8))))
		{
			return false;
		}
		
		for(int year = 0;year < 4; ++year)
        {
            if (!(numbers.contains(date.substring(year,year+1))))
            {
				return false;
            }
        }
		for(int month = 5;month < 7; ++month)
        {
            if (!(numbers.contains(date.substring(month,month+1))))
            {
				return false;
            }
        }
		for(int day = 8;day < 10; ++day)
        {
            if (!(numbers.contains(date.substring(day,day+1))))
            {
				return false;
            }
        }
		
		birthday = date;
		
		return true;
	}
	
	/**
    * 
    * @setSSN Sets the SSN varable taking in a string date making sure it works
    * 
    */
	
	public boolean setSSN(String ssn)
	{
		String numbers = "1234567890";
		String dash = "-";
		
		String allnums = ssn.substring(0,3) + ssn.substring(4,6) + ssn.substring(8,11);
		String alldashes = ssn.substring(3,4) + ssn.substring(6,7);
		
		if ((ssn.length() > 11) || !(alldashes.contains("--")))
		{
			System.out.println("fail here");
			return false;
		}
		
		for(int x = 0;x < allnums.length(); ++x)
        {
            if (!(numbers.contains(allnums.substring(x,x+1))))
            {
				System.out.println("fail here 2");
				return false;
            }
        }
		
		this.ssn = ssn;
		
		return true;
	}
	
	/**
    * 
    * @setGrossIncome Sets the setGrossIncome varable
    * 
    */
	
	public boolean setGrossIncome(float grossIncome)
	{
		if (grossIncome < 0)
		{
			return false;
		}
		else
		{
			float x = grossIncome * (float)100.00;
			
			this.grossIncome = ((Math.round(x)) / (float)100.00);
			return true;
		}
	}
	
	/**
    * 
    * @getGrossIncome Getter for the GrossIncome varable
    * 
    */
	
	public float getGrossIncome()
	{
		return grossIncome;
	}
	
	/**
    * 
    * @getId Getter for the ID varable
    * 
    */
	
	public int getId()
	{
		return id;
	}
	
	/**
    * 
    * @toString turns person object into a readable string
    * 
    */
	
	public String toString()
	{
		return (name + " " + "xxx-xx-" + ssn.substring(7,11) + " " + birthday.substring(0,4) + "/**/**");
	}
	
	protected float deduction(Family family)
	{
		return (float)0.0;
	}
	
}