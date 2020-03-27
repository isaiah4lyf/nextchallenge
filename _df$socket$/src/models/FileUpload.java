package models;

import java.util.List;

public class FileUpload {
	private String _id;
    private String FileName;
    private String UserID;
    private String FileType;
    private String UploadDateTime;
    private List<String> FileBaseUrls;
    
    public String get_id() {
		return _id;
	}
	public void set_id(String _id) {
		this._id = _id;
	}
	public String getFileName() {
		return FileName;
	}
	public void setFileName(String fileName) {
		FileName = fileName;
	}
	public String getUserID() {
		return UserID;
	}
	public void setUserID(String userID) {
		UserID = userID;
	}
	public String getFileType() {
		return FileType;
	}
	public void setFileType(String fileType) {
		FileType = fileType;
	}
	public String getUploadDateTime() {
		return UploadDateTime;
	}
	public void setUploadDateTime(String uploadDateTime) {
		UploadDateTime = uploadDateTime;
	}
	public List<String> getFileBaseUrls() {
		return FileBaseUrls;
	}
	public void setFileBaseUrls(List<String> fileBaseUrls) {
		FileBaseUrls = fileBaseUrls;
	}
}
