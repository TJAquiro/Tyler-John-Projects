//TODO: None. No changes allowed.

import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.*;
import javafx.geometry.*;
import javafx.scene.layout.*;

import java.util.Random;

/**
 * A class for minesweeper GUI.
 *
 * @author Y. Zhong
 */

public class MineGUI extends Application{
	
	/**
	 * Stage for display.
	 */  
	private Stage mineStage;
	
	/**
	 * Grid pane for grid display.
	 */  
	private GridPane mineGrid;
	
	/**
	 * Label to show game status.
	 */  
	private Label statusLabel;
	
	/**
	 * Label to show mines to be flagged.
	 */  
	private Label mineCountLabel;
	
	/**
	 * Menu for New Game.
	 */  
	private MenuBar menuBar;
	
	/**
	 * Minesweeper game to display.
	 */  
	private MineSweeper game;
	
	
	/**
	 * The level of current minesweeper game.
	 */  
	private MineSweeper.Level level;
	
	/**
	 * Random number generator used to create minesweeper games.
	 */  
	private Random random;

	/**
	 * Number of rows for a customized game.
	 */	  
	private int customRow;
	
	/**
	 * Number of columns for a customized game.
	 */	  
	private int customCol;
	
	/**
	 * Number of mines for a customized game.
	 */	  
	private int customMine; 
	
	/**
	 * String to display details of a customized game..
	 */	  
	String customText = "(TBD)";
	
	/**
	 *  Main method for the GUI.
	 *  @param args command line args (not used)
	 */
	public static void main(String[] args) {
		launch(args);
	}
	
	/**
	 * The method to initialize the game to display.
	 */
	@Override
	public void init(){
		random = new Random(10);
		level = MineSweeper.Level.TINY;
		game = new MineSweeper(random.nextInt(),level);
	}

	
	/**
	 * The method to set up the stage for display.
	 * @param stage new stage to use
	 */
	@Override
	public void start(Stage stage) {
		// Create a pane and set its properties
		mineStage = stage;
		
		ScrollPane wrapperPane = new ScrollPane();
		wrapperPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
		VBox mainPane = new VBox();
		
		//menu
		setUpMenu();
		
		//grid for the board
		mineGrid = new GridPane();
		for(int row = 0; row < game.rowCount(); row++){
			for (int col = 0; col < game.colCount(); col++){
				ToggleButton button = new ToggleButton();
				button.setText(" ");
				button.setMinWidth(30);
				final int rowV = row;
				final int colV = col;
				button.setOnMousePressed(
					mouseEvent -> {
						//left click: click/open
						if (mouseEvent.isPrimaryButtonDown()){
							if (game.isFlagged(rowV, colV)){
								button.setSelected(true);
								return;
							}
							
							if (game.isVisible(rowV, colV)){
								button.setSelected(false);
								return;
							}
							
							final int count = game.clickAt(rowV, colV);
							if (count>0){
								button.setText(count+""); //nbr count>0
							}
							if (count>=0){
								button.setSelected(false);
								//button.setDisable(true);
							}
							
							if (count == -1){
								button.setText("X"); //exploded
								button.setTextFill(Color.RED);
								button.setStyle("-fx-background-color: coral");
							}
							
							if (count == 0){
								//need to repaint some nbr buttons
								updateButtons(rowV, colV);
							}
							
							//otherwise no button change
							updateStatus();
							
						}else if (mouseEvent.isSecondaryButtonDown()){
							//right click: flag or unflag
							
							if (game.isVisible(rowV,colV))
								return;
							
							if (game.isFlagged(rowV, colV)){
								game.unFlagAt(rowV, colV);
								button.setText(" ");
							}
							else{
								game.flagAt(rowV,colV);
								button.setText("F");
								button.setSelected(false);
							}
							updateStatus();
						}

					}
				);
				
				button.setOnMouseReleased(
					mouseEvent -> {
						if (game.isVisible(rowV, colV))
							button.setSelected(true);
						if (game.isFlagged(rowV, colV))
							button.setSelected(false);
					}
				);
				mineGrid.add(button, col, row);
			}
		}
		
		wrapperPane.setContent(mineGrid);
		
		//add Status 
		statusLabel = new Label("INIT");	   
		Font font = Font.font("Verdana", FontWeight.BOLD,16);
		statusLabel.setFont(font);
		
		//add mine count
		mineCountLabel = new Label("MINES: "+game.mineLeft());
		mineCountLabel.setFont(font);
			 
		mainPane.getChildren().addAll(menuBar, wrapperPane,statusLabel, mineCountLabel);
		
		Scene scene = new Scene(mainPane);
		mineStage.setTitle("MineSweeper");
		mineStage.setScene(scene); 
		mineStage.show();
	}
	
	/**
	 *  The method to set up the menu and menu actions.
	 */	
	private void setUpMenu(){
		menuBar = new MenuBar();
		Menu newGame = new Menu("New Game");
		MenuItem repeat = new MenuItem("New Game (Current Setting)");
		repeat.setOnAction(e ->{
			if (level!= MineSweeper.Level.CUSTOM)
				game = new MineSweeper(random.nextInt(),level);
			else
				game = new MineSweeper(random.nextInt(),level,customRow, customCol, customMine);
			start(mineStage);
		});
		
		SeparatorMenuItem separator = new SeparatorMenuItem();
		
		RadioMenuItem tiny = new RadioMenuItem("Tiny (5x5, 3)");
		tiny.setOnAction(e ->{
			level = MineSweeper.Level.TINY;
			game = new MineSweeper(random.nextInt(),level);
			start(mineStage);
		});
		
		RadioMenuItem easy = new RadioMenuItem("Easy (9x9, 10)");
		easy.setOnAction(e ->{
			level = MineSweeper.Level.EASY;
			game = new MineSweeper(random.nextInt(),level);
			start(mineStage);
		});
		
		RadioMenuItem middle = new RadioMenuItem("Medium (16x16, 40)");
		middle.setOnAction(e ->{
			level = MineSweeper.Level.MEDIUM;
			game = new MineSweeper(random.nextInt(),level);
			start(mineStage);
		});
		
		RadioMenuItem hard = new RadioMenuItem("Hard (16x30, 99)");
		hard.setOnAction(e ->{
			level = MineSweeper.Level.HARD;
			game = new MineSweeper(random.nextInt(),level);
			start(mineStage);
		});
		
		RadioMenuItem custom = new RadioMenuItem("Custom "+customText);
		custom.setOnAction(e ->{
			level = MineSweeper.Level.CUSTOM;
			getCustomedSetting();
		});
		
		ToggleGroup toggleGroup = new ToggleGroup();
		toggleGroup.getToggles().addAll(tiny, easy, middle, hard, custom);
		
		
		switch (level){
			case EASY: 
				easy.setSelected(true);
				break;
			case MEDIUM: 
				middle.setSelected(true);
				break;
			case HARD: 
				hard.setSelected(true);
				break;
			case TINY: 
				tiny.setSelected(true);
				break;
			case CUSTOM: 
				custom.setSelected(true);
				break;
			default:
				;
		}
		
		newGame.getItems().addAll(repeat, separator, tiny, easy, middle, hard, custom); 
		
		menuBar.getMenus().addAll(newGame);
			
	}
	
	/**
	 *  The method to pop up a new window for customized level setting.
	 */
	private void getCustomedSetting(){
		Stage dimensionSettings = new Stage();
		dimensionSettings.setWidth(200);

		VBox inputFields = new VBox();

		Label message = new Label("Customize");

		Label row = new Label("Number of rows (1-30): ");
		TextField rowInput = new TextField();
		rowInput.setMaxWidth(50);
		Label col = new Label("Number of columns (1-60): ");
		TextField colInput = new TextField();
		colInput.setMaxWidth(50);
		Label mine = new Label("Number of mines: ");
		TextField mineInput = new TextField();
		mineInput.setMaxWidth(50);

		Button update = new Button("Update");
		update.setOnAction(e -> {
			try {
				
				customRow = Integer.parseInt(rowInput.getCharacters().toString());
				customCol = Integer.parseInt(colInput.getCharacters().toString());
				customMine = Integer.parseInt(mineInput.getCharacters().toString());
				if (customRow<=0 || customCol<=0 || customMine <=0 ||
						customRow>30 || customCol>60 ||
						customMine>customRow*customCol){
					//check mine num <= col*row
					message.setTextFill(Color.RED);
					message.setText("Please set valid positive integer values. ");
				}
				else{
					if (customMine==customRow*customCol){
						customMine--; //at least one non-mine cell 
						if (customMine == 0){
							message.setTextFill(Color.RED);
							message.setText("Please set valid positive integer values.");
							return;
						}
					}
					customText = String.format("(%dx%d, %d)", customRow, customCol, customMine);
					game = new MineSweeper(random.nextInt(),level,customRow, customCol, customMine);
					start(mineStage);
					dimensionSettings.close();
				}
			}catch (NumberFormatException ex) {
				message.setTextFill(Color.RED);
				message.setText("Please set valid positive integer values.");
			}

		});

		inputFields.getChildren().addAll(message, row, rowInput, col, colInput, mine, mineInput, update);

		dimensionSettings.setScene(new Scene(inputFields));
		dimensionSettings.show();

	}

	/**
	 * The method to update buttons (cells) that are visible after one left-click.
	 * @param row row index of cell clicked
	 * @param col col index of cell clicked
	 */   
	private void updateButtons(int row, int col){
		
		for (int i=0; i<game.rowCount(); i++){
			for (int j=0; j<game.colCount();j++){
				if (game.isVisible(i,j) && game.getCount(i,j)>=0){
					int pos = j + i * game.colCount();
					ToggleButton button = (ToggleButton) mineGrid.getChildren().get(pos);
					if (i!=row || j!=col){
						button.setSelected(true);
						if (game.getCount(i,j)>0)
							button.setText(game.getCount(i,j)+"");
					}
					
				}
					
			}
		}
		
	}
	
	
	/**
	 *  The method to update game status and mine count.
	 */   
	private void updateStatus(){
		statusLabel.setText(game.getStatus());
		if (game.isSolved())
			statusLabel.setTextFill(Color.FORESTGREEN);
		if (game.isExploded())
			statusLabel.setTextFill(Color.RED);
		
		//disable all buttons if solved or exploded
		if (game.isSolved() || game.isExploded()){
			for (int i=0; i<game.rowCount(); i++){
				for (int j=0; j<game.colCount();j++){
					int pos = j + i * game.colCount();
					ToggleButton button = (ToggleButton) mineGrid.getChildren().get(pos);
					button.setDisable(true);
					if (game.hasMine(i,j)){
						//mark mines
						button.setText("X"); //exploded
						button.setTextFill(Color.RED);
					}
				}
			}
		}
		if (!game.isSolved())
			mineCountLabel.setText("MINES: " + game.mineLeft());
		else
			mineCountLabel.setText("MINES: 0");
	}
}