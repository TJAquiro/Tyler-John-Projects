//TODO: Nothing, all done.

import org.apache.commons.collections15.Factory;

import java.awt.Color;

/**
 *  An edge representation for the graph simulation.
 *  
 *  @author Katherine (Raven) Russell
 */
class GraphEdge extends GraphComp {
	/**
	 *  The number of edges created so far (for gerating unique ids
	 *  from the factory method).
	 */
	public static int edgeCount = 0;
	
	/**
	 *  The weight of the edge.
	 */
	private int weight = 0;

	
	/**
	 *  Constructs an edge with a given id.
	 *  
	 *  @param id the unique id of the edge
	 */
	public GraphEdge(int id) { 
		this.id = id; 
		this.weight = (int)(Math.random()*20)+1; 
		this.color = Color.BLACK;
	}
	
	/**
	 *  Constructs an edge with a given id and weight.
	 *  
	 *  @param id the unique id of the edge
	 *  @param weight the weight of the edge
	 */
	public GraphEdge(int id, int weight) { 
		this.id = id; 
		this.weight = weight; 
		this.color = Color.BLACK; 
	}
	

	/**
	 *  Fetches the weight of the edge.
	 *  
	 *  @return the weight of the edge
	 */
	public int getWeight() { return weight; }


	/**
	 *  {@inheritDoc}
	 */
	@Override
	public int compareTo(GraphComp e) { 
		if (!(e instanceof GraphEdge)){
			return super.compareTo(e);
		}
		GraphEdge edge = (GraphEdge) e;
		if (this.weight!=edge.weight)
			return this.weight - edge.weight;
		else
			return this.id-e.id; //use id to break the tie
	}


	/**
	 *  {@inheritDoc}
	 */
	@Override
	public String toString() { return ""+id+":"+weight; }
	
	/**
	 *  Generates a new edge with a random weight and a (probably)
	 *  unique id.
	 *  
	 *  @return a new edge with a random weight
	 */
	public static Factory<GraphEdge> getFactory() { 
		return new Factory<GraphEdge> () {
			public GraphEdge create() {
				return new GraphEdge(edgeCount++);
			}
		};
	}
}
