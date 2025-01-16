import java.util.Collection;
import java.util.List;
import java.util.LinkedList;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.EnumSet;
import java.util.Arrays;
import java.util.Collections;

public class AvailableCourse <K, V extends Comparable<V>> implements Comparable<AvailableCourse <K,V>>
{
	private K key;
	private V value;
	
	/**
	    * Constructor for AvailableCourse Object
	    *
	    * @param key, usally the CRN of a course
	    * @param value, the Corresponding Course object of that CRN
	    * @return none
	    * */
	
	public AvailableCourse(K key, V value)
	{
		this.key = key;
		this.value = value;
	}
	
	/**
	    * @override
	    * Overrides equals() methods compares if two AvailableCourse objects are the same
	    *
	    * @param another object
	    * @return boolean true or false
	    * */
	
	public boolean equals(Object obj) 
	{
		//validates obj isn't null and is an AvailableCourse
		
        if (obj == null || !(obj instanceof AvailableCourse)) 
        {
            return false;
        }
        
        //ensures obj is read as an AvailableCourse
        AvailableCourse<?, ?> other = (AvailableCourse<?, ?>) obj;
        
        //uses equals() method in value to check if they are the same
        return this.value.equals(other.value);
    }
	
	/**
	    * Implementation of compareTo() method from Comparable interface
	    * compares object's value
	    *
	    * @param another AvailableCourse object
	    * @return an integer
	    * */
	
	public int compareTo(AvailableCourse<K, V> other) 
	{
        return this.value.compareTo(other.value);
    }
	
	/**
	    * Getter for key
	    *
	    * @param None
	    * @return this object's key
	    * */

	public K getKey() {
		return key;
	}
	
	/**
	    * Getter for value
	    *
	    * @param None
	    * @return this object's value
	    * */

	public V getValue() {
		return value;
	}
}
