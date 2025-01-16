import java.util.Collection;
import java.util.HashSet;

public class CourseSearcher implements Searchable {

	private Collection<String> searchTerms;
	
	/**
	    * Constructor for CourseSearcher Object
	    *
	    * @param searchTerms, a Collection of strings the user will be searching for
	    * @return none
	    * */
	
	public CourseSearcher(Collection<String> searchTerms)
	{
		this.searchTerms = new HashSet<>(searchTerms);
	}
	
	/**
	    * Override for interface's matches()
	    * returns true if a searchTerm is found in a Course.toString()
	    *
	    * @param AvailableCourse objects
	    * @return boolean, true or false
	    * */
	
	public boolean matches(AvailableCourse<String, Course> x) 
	{
		for (String s : searchTerms) 
		{	
		    if (x.getValue().toString().indexOf(s) != -1)
		    {
		    	return true;
		    }
		}
		return false;
	}

}
