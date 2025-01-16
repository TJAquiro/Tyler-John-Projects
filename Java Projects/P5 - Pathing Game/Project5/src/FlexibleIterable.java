import java.util.Iterator;
import java.util.NoSuchElementException;

public interface FlexibleIterable<T> extends Iterable<T> {

	/**
	 * 
	 * FlexibleIterable interface 
	 * has the following methods.
	 * 
	 */
	
    public default Iterator<T> iterator(String iterableObjectName) 
    {
		return null;
	}
}