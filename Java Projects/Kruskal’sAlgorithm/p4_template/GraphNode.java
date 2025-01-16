//TODO: Nothing, all done.

import org.apache.commons.collections15.Factory;

import java.awt.Color;

/**
 *  A node representation for the graph simulation.
 *  
 *  @author Katherine (Raven) Russell
 */
class GraphNode extends GraphComp {
	/**
	 *  The number of nodes created so far (for gerating unique ids
	 *  from the factory method).
	 */
	public static int nodeCount = 0;
	
	/**
	 *  The boolean flag to indicate whether a node is active or not.
	 *  Used to support certain graph algorithms.
	 */
	private boolean active; 
	
	/**
	 *  The integer cost associated with each node.
	 *  Used to support certain graph algorithms.
	 */
	private int cost;

	
	/**
	 *  Constructs a node with a given id.
	 *  
	 *  @param id the unique id of the node
	 */
	public GraphNode(int id) { 
		this.id = id; this.color = Color.WHITE; 
		this.active = false;
		this.cost = 0;
	}
	
	/**
	 *  Set this node to be active.
	 */
	public void setActive(){ active = true; }

	/**
	 *  Set this node to be inactive.
	 */
	public void unsetActive(){ active = false; }

	/**
	 *  Report the active status of this node.
	 *  @return whether this node is active or not
	 */
	public boolean isActive() {return active; }

	/**
	 *  Set the cost of this node to be the incoming value.
	 *  
	 *  @param cost the cost to set for this node
	 */
	public void setCost(int cost) { this.cost = cost; }

	/**
	 *  Report the cost of this node.
	 *  @return the cost of this node
	 */
	public int getCost() { return this.cost; }
								
	
	/**
	 *  {@inheritDoc}
	 */
	@Override
	public int compareTo(GraphComp n) { 
		if (!(n instanceof GraphNode)){
			return super.compareTo(n);
		}
		GraphNode node = (GraphNode) n;
		if (this.cost!=node.cost)
			return this.cost - node.cost;
		else
			return this.id-n.id; //use id to break the tie
	}


	
	/**
	 *  {@inheritDoc}
	 */
	@Override
	public String toString() {
		return ""+id;
	}
	
	/**
	 *  Generates a new node with a (probably) unique id.
	 *  
	 *  @return a new node
	 */
	public static Factory<GraphNode> getFactory() { 
		return new Factory<GraphNode> () {
			public GraphNode create() {
				return new GraphNode(nodeCount++);
			}
		};
	}
}
