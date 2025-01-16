import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class InPersonCourse extends LectureCourse  {
	
	/**
	    * Constructor for InPersonCourse Object
	    * Utilizes Parent constructors
	    *
	    * @param crn the Course's Registration Number
	    * @param title the Course's Name
	    * @param levels the the levels that this course admits (Graduate, Non-Degree, Undergraduate)
	    * @param instructor the teacher of the course
	    * @param credit the number of credits
	    * @param meetDays the days of the week this Class meets
	    * @param gtas a Collection GTAs in order of number of hours they commit to help students in this course
	    * @return none
	    * */
	
	public InPersonCourse(String crn, String title, Set<String> levels, String instructor, int credit, Set<MeetDay> meetDays, Collection<String> gtas) throws LectureCourseException
	{
		super(crn, title, levels, instructor, credit, meetDays, gtas);
	}
	
	/**
	    * @override
	    * Overrides parent's getType()
	    *
	    * @param none
	    * @return String, "In-Person"
	    * */
	
	public String getType()
	{
		return ("In-Person");
	}
}
