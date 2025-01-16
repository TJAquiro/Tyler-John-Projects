import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class CourseCatalog {
	
	private List<AvailableCourse<String, Course>> catalog;
	
	/**
	    * Constructor for CourseCatalog
	    * initializes catalog field
	    *
	    * @param none
	    * @return none
	    * */
	
	public CourseCatalog()
	{
		catalog = new ArrayList<>();
	}
	
	/**
	    * Adds an AvailableCourse object to catalog using crn and course
	    * initializes catalog field
	    *
	    * @param crn, the course's CRN
	    * @param a course object
	    * @return none
	    * */
	
	public void add(String crn, Course course)
	{
		
		if (catalog.size() == 0)
		{
			catalog.add(new AvailableCourse<>(crn, course));
		}
		else
		{
			for(int x = 0;x < catalog.size(); ++x)
			{
				if (catalog.get(x).getValue().getCrn().equals(crn))
				{	
					throw new CourseCatalogException(catalog.get(x).getValue().getCrn(), catalog.get(x).getValue());
				}
			}
			
			catalog.add(new AvailableCourse<>(crn, course));
		}
	}
	
	/**
	    * Uses CourseSearcher's matches function to see if any of the Catalog's 
	    * classes match the search terms, if so that course object is added to a 
	    * List and returned
	    *
	    * @param searchable, a CourseSearcher object
	    * @return List of classes that match
	    * */
	
	public List<AvailableCourse<String, Course>> search(CourseSearcher searchable)
	{
		
		List<AvailableCourse<String, Course>> returnList = new ArrayList<AvailableCourse<String, Course>>();
		
		for(int i = 0; i < catalog.size(); ++i)
		{
			
			if (searchable.matches(catalog.get(i)))
			{
				returnList.add(catalog.get(i));
			}
		}
		
		return returnList;
	}
	
	/**
	    * Utilizes the compare to in the Lecture course object 
	    * to sort the objects in catalog according to these rules
	    * 1. In-Person courses come before Hybrid courses and Hybrid courses come before Onlinecourses.
		* 2. In-Person courses are sorted first by credit, then by title.
		* 3. Hybrid courses are sorted first by title, then by the number of credits.
		* 4. Online courses are sorted first by title, then by the number of meetDays
	    *
	    * @param none
	    * @return none
	    * */
	
	public void sort()
	{
		Collections.sort(catalog);
	}
}
