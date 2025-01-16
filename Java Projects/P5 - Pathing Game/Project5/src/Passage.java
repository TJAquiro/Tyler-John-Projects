
public class Passage extends Block {
	
	private int value;
	
	/**
	    * Constructor for Passage Object
	    *
	    * @param value the amount of points associated with the Passage
	    * @return none
	    * */
	
	public Passage(int value)
	{
		this.value = value;
	}
	
	/**
	    * @override
	    * Overrides toString() method
	    *
	    * @param none
	    * @return String, "value"
	    * */
	
	public String toString()
	{
		return (value + "");
	}
	
	/**
	    * @override
	    * Overrides parent's getValue() method
	    *
	    * @param none
	    * @return int value
	    * */
	
	public int getValue()
	{
		return value;
	}
}
