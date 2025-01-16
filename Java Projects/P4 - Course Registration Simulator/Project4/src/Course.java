import java.util.Collection;
import java.util.List;
import java.util.LinkedList;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.EnumSet;
import java.util.Arrays;
import java.util.Collections;

public abstract class Course implements Comparable<Course> {
	private String crn;
	private String title;
	private Set<String> levels;
	
	/**
	    * Constructor for Course Object
	    * validates inputs
	    *
	    * @param crn the Course's Registration Number
	    * @param title the Course's Name
	    * @param levels the the levels that this course admits (Graduate, Non-Degree, Undergraduate)
	    * @return none
	    * */
	
	public Course(String crn, String title, Set<String> levels) throws LectureCourseException
	{	
		
		this.crn = crn;
		
		//validates title to ensure it's at least 15 characters long
		
		if (title.length() < 15)
		{
			throw new LectureCourseException("title");
		}
		else
		{
			this.title = title;
		}
		
		//validates levels to ensure it contains at least one of the following Graduate, Non-Degree, or Undergraduate
		
		if (!levels.contains("Graduate") && 
			!levels.contains("Non-Degree") && 
			!levels.contains("Undergraduate")) 
			
		{
            throw new LectureCourseException("levels");
        }
		else
		{
			this.levels = new HashSet<>(levels);
		}
	}
	
	/**
	    * Returns the type of this object, (Course)
	    *
	    * @param None
	    * @return String, "Course"
	    * */
	
	public String getType() 
	{
		return "Course";
	}
	
	/**
	    * @override 
	    * Overrides equals() method
	    * Compares 2 Course objects to see if their Crn is Equal
	    *
	    * @param Another Object
	    * @return Boolean True or False
	    * */
	
	public boolean equals(Object x)
	{
		if (x instanceof Course && this.crn.equals(((Course) x).getCrn()))
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	/**
	    * @override 
	    * Overrides toString() method
	    * Formats data fields into a string 
	    *
	    * @param None
	    * @return String, "type: type, CRN: crn, title: title, levels: levels"
	    * */
	
	public String toString()
	{
		return "type: " + this.getType() + ", CRN: " + crn + ", title: " + title + ", levels: " + Arrays.deepToString(levels.toArray());
	}
	
	/**
	    * Getter for Crn
	    *
	    * @param None
	    * @return this object's crn
	    * */
	
	public String getCrn() {
		return crn;
	}
	
	/**
	    * Getter for Title
	    *
	    * @param None
	    * @return this object's Title
	    * */
	
	public String getTitle() {
		return title;
	}
	
	/**
	    * Getter for Levels
	    *
	    * @param None
	    * @return this object's Levels
	    * */
	
	public Collection<String> getLevels() {
		return levels;
	}
}
