import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Access "../lib/access";

mixin (sessions : Access.SessionState) {
  public type Session = Access.Session;

  public type LoginResult = {
    #ok : Session;
    #invalidCredentials;
  };

  /// Memverifikasi kredensial akun bawaan dan memulai sesi untuk pemanggil.
  public shared ({ caller }) func login(username : Text, password : Text) : async LoginResult {
    if (username != Access.adminUsername or password != Access.adminPassword) {
      return #invalidCredentials;
    };
    let session : Session = { username = username; loginAt = Time.now() };
    sessions.add(caller, session);
    #ok(session);
  };

  /// Mengakhiri sesi pemanggil.
  public shared ({ caller }) func logout() : async () {
    sessions.remove(caller);
  };

  /// Mengembalikan sesi pemanggil, atau `null` bila belum login.
  public query ({ caller }) func getSession() : async ?Session {
    sessions.get(caller);
  };

  /// `true` bila pemanggil sudah login sebagai admin.
  public query ({ caller }) func isCallerAdmin() : async Bool {
    Access.isLoggedIn(sessions, caller);
  };
};
