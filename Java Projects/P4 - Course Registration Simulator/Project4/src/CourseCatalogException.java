
public class CourseCatalogException extends IllegalStateException  {
	private String crn;
	private Course course;
	
	/**
	    * Constructor for CourseCatalogException
	    *
	    * @param crn, the crn that's the problem
	    * @param course, the course that's the problem
	    * @return none
	    * */
	
	public CourseCatalogException(String crn, Course course)
	{
		super("The course’s CRN is already in the catalog.");
		
		this.crn = crn;
		this.course = course;
	}
	
	/**
	    * Getter for course
	    *
	    * @param None
	    * @return this object's course
	    * */
	
	public Course getCourse()
	{
		return course;
	}
	
	/**
	    * Getter for crn
	    *
	    * @param None
	    * @return this object's crn
	    * */
	
	public String getCrn()
	{
		return crn;
	}

}
