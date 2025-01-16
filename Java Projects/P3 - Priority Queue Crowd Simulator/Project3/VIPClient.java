
public class VIPClient extends Client implements Prioritizable {
	private int memberSince;
	private int priority;
	
	public VIPClient (String firstName, String lastName, int birthYear, String gender, int arrivalTime, int patience, Request[] requests, int memberSince, int priority)
	{
		super(firstName, lastName, birthYear, gender, arrivalTime, patience, requests);
		this.memberSince = memberSince;
		this.priority = priority;
	}
	
	public String toString()
	{
		return (super.toString() + "\n" +
		"** VIP since : " + memberSince + "\n" +
		"** priority : " + priority);
	}
	
	//setters
	public void setMemberSince(int memberSince){
		this.memberSince = memberSince;
	}
	
	public void setPriority(int a)
	{
		priority = a;
	}
	
	//getters
	public int getMemberSince(){
		return memberSince;
	}
	
	public int getPriority(){
		return priority;
	}
}
