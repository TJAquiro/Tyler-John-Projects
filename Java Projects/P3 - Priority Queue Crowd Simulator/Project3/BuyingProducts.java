
public class BuyingProducts extends Request{
	
	private String[] itemsToBuy;

	public BuyingProducts (String description, int priority, int difficulty, String[] itemsToBuy)
	{
		super();
		setDescription(description);
		setPriority(priority);
		setDifficulty(difficulty);
		
		this.itemsToBuy = itemsToBuy;
		
		setFactor(2);
		setStatus(Status.NEW);
	}
	
	
	public int calculateProcessingTime()
	{	
		return getDifficulty() * getFactor() * itemsToBuy.length;
	}
	
	public void setItemsToBuy(String[] itemsToBuy){
		this.itemsToBuy = itemsToBuy;
	}
	
	public String[] getItemsToBuy(){
		return itemsToBuy;
	}
}
