package session.models;

import java.time.LocalDateTime;

public class MessageData {
	private String Command;
	private String CommandJsonData;
	private String CommandTimestamp = LocalDateTime.now().toString() ;

	public String getCommand() {
		return Command;
	}
	public void setCommand(String command) {
		Command = command;
	}
	public String getCommandJsonData() {
		return CommandJsonData;
	}
	public void setCommandJsonData(String commandJsonData) {
		CommandJsonData = commandJsonData;
	}
	public String getCommandTimestamp() {
		return CommandTimestamp;
	}
	public void setCommandTimestamp(String commandTimestamp) {
		CommandTimestamp = commandTimestamp;
	}
}
	
