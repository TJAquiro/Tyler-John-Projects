
public class Obstacle extends Block {

	private String label;
	
	/**
	    * Constructor for Obstacle Object
	    *
	    * @param label the Obstacle's Name
	    * @return none
	    * */
	
	public Obstacle(String label)
	{
		this.label = label;
	}
	
	/**
	    * @override
	    * Overrides toString() method
	    *
	    * @param none
	    * @return String, "label"
	    * */
	public String toString()
	{
		return(label);
	}
	
	/**
	    * @override
	    * Overrides parent's getValue() method
	    *
	    * @param none
	    * @return int 0, all Obstacles have a default value of zero
	    * */
	
	public int getValue() {
		
		return 0;
	}

}
