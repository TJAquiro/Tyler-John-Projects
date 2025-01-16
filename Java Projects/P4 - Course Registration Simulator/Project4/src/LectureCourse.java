import java.util.Collection;
import java.util.List;
import java.util.LinkedList;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.EnumSet;
import java.util.Arrays;
import java.util.Collections;

public abstract class LectureCourse extends Course {
	
	private String instructor;
	private int credit;
	private Set<MeetDay> meetDays;
	private Collection<String> gtas;
	
	/**
	    * Constructor for LectureCourse Object
	    * validates inputs
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
	
	public LectureCourse(String crn, String title, Set<String> levels, String instructor, int credit, Set<MeetDay> meetDays, Collection<String> gtas) throws LectureCourseException
	{
		super(crn, title, levels);
		
		this.instructor = instructor;
		this.credit = credit;
		this.gtas = new ArrayList<>(gtas);
		
		if (meetDays.size() < 1 || meetDays.size() > 2)
		{
			throw new LectureCourseException("levels");
		}
		else
		{
			this.meetDays = new HashSet<>(meetDays);
		}
	}
	
	/**
	    * @override
	    * Overrides toString() of the parent class, Course
	    *
	    * @param none
	    * @return String, "instructor: instructor, credit: credit, meetDays: meetDays, gtas: gtas,type: type, CRN: crn, title: title, levels: levels"
	    * */
	
	public String toString()
	{
		return ("instructor: " + instructor + ", credit:" + credit + ", meetDays: " + Arrays.deepToString(meetDays.toArray()) + ", gtas: " + Arrays.deepToString(gtas.toArray()) + "," + super.toString());
	}
	
	/**
	    * Implementation of compareTo() method
	    * Compares two course objects and returns 1, 0, or -1 depending on these rules
	    * 1. In-Person courses come before Hybrid courses and Hybrid courses come before Onlinecourses.
		* 2. In-Person courses are sorted first by credit, then by title.
		* 3. Hybrid courses are sorted first by title, then by the number of credits.
		* 4. Online courses are sorted first by title, then by the number of meetDays
	    * will be used to implement sort() functionality
	    * 
	    * @param another course object
	    * @return -1, 0, 1
	    * */
	
	public int compareTo(Course other)
	{
		
		//if this is an InPersonCourse
		
		if(this.getType().equals("In-Person") && (other).getType().equals("In-Person"))
		{
			if (this.getCredit() < ((InPersonCourse)other).getCredit())
			{
				return (-1);
			}
			else if (this.getCredit() == ((InPersonCourse)other).getCredit())
			{
				return(this.getTitle().compareTo(((InPersonCourse)other).getTitle()));
			}
			else
			{
				return (1);
			}
		}
		
		if(this.getType().equals("In-Person") && ((other).getType().equals("Hybrid") || (other).getType().equals("Online")))
		{
			return (-1);
		}
		
		//if this is an HybridCourse
		
		if(this.getType().equals("Hybrid") && (other).getType().equals("In-Person"))
		{
			return (1);
		}
		
		if(this.getType().equals("Hybrid") && (other).getType().equals("Hybrid"))
		{
			
			if (this.getTitle().compareTo(((HybridCourse)other).getTitle()) != 0)
			{
				return (this.getTitle().compareTo(((HybridCourse)other).getTitle()));
			}
			else
			{
				if (this.getCredit() < ((HybridCourse)other).getCredit())
				{
					return (-1);
				}
				else if (this.getCredit() == ((HybridCourse)other).getCredit())
				{
					return(0);
				}
				else
				{
					return (1);
				}
			}
		}
		
		if(this.getType().equals("Hybrid") && (other).getType().equals("Online"))
		{
			
			return (-1);
		}
		
		//if this is an Online
		
		if(this.getType().equals("Online") && other.getType().equals("Online"))
		{
			if (this.getTitle().compareTo(((OnlineCourse)other).getTitle()) != 0)
			{					
				return(this.getTitle().compareTo(((OnlineCourse)other).getTitle()));
			}
			else
			{
				if (this.getMeetDays().size() < ((OnlineCourse)other).getMeetDays().size())
				{
					return (-1);
				}
				else if (this.getMeetDays().size() == ((OnlineCourse)other).getMeetDays().size())
				{
					return(0);
				}
				else
				{
					return (1);
				}
			}
		}
		
		if(this.getType().equals("Online") && ((other).getType().equals("Hybrid") || (other).getType().equals("In-Person")))
		{
			return (1);
		}
		
		return(0);
	}
	
	
	/**
	    * Getter for instructor
	    *
	    * @param None
	    * @return this object's instructor
	    * */
	
	public String getInstructor() {
		return instructor;
	}
	
	/**
	    * Getter for credit
	    *
	    * @param None
	    * @return this object's credit
	    * */
	
	public int getCredit() {
		return credit;
	}
	
	/**
	    * Getter for meetDays
	    *
	    * @param None
	    * @return this object's meetDays
	    * */
	
	public Collection<MeetDay> getMeetDays() {
		return meetDays;
	}
	
	/**
	    * Getter for gtas
	    *
	    * @param None
	    * @return this object's gtas
	    * */
	
	public Collection<String> getGtas() {
		return gtas;
	}
	
	
}
