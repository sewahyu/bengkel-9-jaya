import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  /// Satu akun bawaan untuk panel admin.
  public let adminUsername = "admin";
  public let adminPassword = "admin01";

  /// Sesi login yang tersimpan per principal pemanggil.
  public type Session = {
    username : Text;
    loginAt : Int;
  };

  public type SessionState = Map.Map<Principal, Session>;

  /// `true` bila pemanggil sudah login sebagai admin.
  public func isLoggedIn(sessions : SessionState, caller : Principal) : Bool {
    switch (sessions.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  /// Menjaga aksi khusus admin: pemanggil harus sudah login.
  public func requireAdmin(
    sessions : SessionState,
    caller : Principal,
    message : Text,
  ) {
    if (not isLoggedIn(sessions, caller)) {
      Runtime.trap(message);
    };
  };
};
