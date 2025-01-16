
public class ReturningItems extends Request{
	
	private String[] itemsToReturn;

	public ReturningItems (String description, int priority, int difficulty, String[] itemsToReturn)
	{
		super();
		setDescription(description);
		setPriority(priority);
		setDifficulty(difficulty);
		
		this.itemsToReturn = itemsToReturn;
		
		setFactor(3);
		setStatus(Status.NEW);
	}
	
	
	public int calculateProcessingTime()
	{	
		return getDifficulty() * getFactor() * itemsToReturn.length;
	}
	
	public void setItemsToReturn(String[] itemsToReturn){
		this.itemsToReturn = itemsToReturn;
	}
	
	public String[] getItemsToReturn(){
		return itemsToReturn;
	}
}
