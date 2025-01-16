
public class LectureCourseException extends Exception {
	
	private String fieldName;

	/**
	    * Constructor for LectureCourseException
	    *
	    * @param fieldName
	    * @return none
	    * */
	
	public LectureCourseException(String fieldName)
	{
		super("an argument has null or illegal value");
		
		this.fieldName = fieldName;
	}
	
	/**
	    * Getter for fieldName
	    *
	    * @param None
	    * @return this object's fieldName
	    * */
	
	public String getFieldName() {
		return fieldName;
	}

}
