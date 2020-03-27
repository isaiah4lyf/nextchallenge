package models;

public class User {
    private int Attempts;
    private int ChallengesCount;

    private String DateOfBirth;

    private String Email;

    private String EmailConfirmed;

    private String FirstName;

    private int FriendsCount;

    private String Gender;

    private String HomeTown;

    private String LastName;

    private String Phone;

    private String _id;

    private String UserName;

    private String UserProPicId;

    private String UserProfileCoverPicId;

    private int Wins;

    public User() {
    }

 

    public int getAttempts() {
		return Attempts;
	}

	public void setAttempts(int attempts) {
		Attempts = attempts;
	}

	public int getChallengesCount() {
		return ChallengesCount;
	}

	public void setChallengesCount(int challengesCount) {
		ChallengesCount = challengesCount;
	}

	public String getDateOfBirth() {
		return DateOfBirth;
	}

	public void setDateOfBirth(String dateOfBirth) {
		DateOfBirth = dateOfBirth;
	}

	public String getEmail() {
		return Email;
	}

	public void setEmail(String email) {
		Email = email;
	}

	public String getEmailConfirmed() {
		return EmailConfirmed;
	}

	public void setEmailConfirmed(String emailConfirmed) {
		EmailConfirmed = emailConfirmed;
	}

	public String getFirstName() {
		return FirstName;
	}

	public void setFirstName(String firstName) {
		FirstName = firstName;
	}

	public int getFriendsCount() {
		return FriendsCount;
	}

	public void setFriendsCount(int friendsCount) {
		FriendsCount = friendsCount;
	}

	public String getGender() {
		return Gender;
	}

	public void setGender(String gender) {
		Gender = gender;
	}

	public String getHomeTown() {
		return HomeTown;
	}

	public void setHomeTown(String homeTown) {
		HomeTown = homeTown;
	}

	public String getLastName() {
		return LastName;
	}

	public void setLastName(String lastName) {
		LastName = lastName;
	}

	public String getPhone() {
		return Phone;
	}

	public void setPhone(String phone) {
		Phone = phone;
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getUserName() {
		return UserName;
	}

	public void setUserName(String userName) {
		UserName = userName;
	}

	public String getUserProPicId() {
		return UserProPicId;
	}

	public void setUserProPicId(String userProPicId) {
		UserProPicId = userProPicId;
	}

	public String getUserProfileCoverPicId() {
		return UserProfileCoverPicId;
	}

	public void setUserProfileCoverPicId(String userProfileCoverPicId) {
		UserProfileCoverPicId = userProfileCoverPicId;
	}

	public int getWins() {
		return Wins;
	}

	public void setWins(int wins) {
		Wins = wins;
	}

}
