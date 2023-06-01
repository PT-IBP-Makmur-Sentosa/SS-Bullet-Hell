// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
declare const firebase: any;
const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Button)
    signupButton: cc.Button = null;

    @property(cc.Button)
    signupCloseButton: cc.Button = null;

    @property(cc.Button)
    loginButton: cc.Button = null;

    @property(cc.Button)
    loginCloseButton: cc.Button = null;

    @property(cc.Sprite)
    signupSprite: cc.Sprite = null;

    @property(cc.Sprite)
    loginSprite: cc.Sprite = null;

    @property(cc.EditBox)
    signupEmail: cc.EditBox = null;

    @property(cc.EditBox)
    signupPassword: cc.EditBox = null;

    @property(cc.EditBox)
    signupUsername: cc.EditBox = null;

    @property(cc.EditBox)
    loginEmail: cc.EditBox = null;

    @property(cc.EditBox)
    loginPassword: cc.EditBox = null;

    @property(cc.Button)
    signupSubmitButton: cc.Button = null;

    @property(cc.Button)
    loginSubmitButton: cc.Button = null;

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    start () {
        cc.audioEngine.playMusic(this.bgm, true);
        this.signupButton.node.on('click', this.onSignupClick, this);
        this.signupCloseButton.node.on('click', this.onSignupCloseClick, this);

        this.loginButton.node.on('click', this.onLoginClick, this);
        this.loginCloseButton.node.on('click', this.onLoginCloseClick, this);

        this.signupSubmitButton.node.on('click', this.firebaseSignup, this);
        this.loginSubmitButton.node.on('click', this.firebaseLogin, this);
    }

    onSignupClick() {
        this.signupSprite.node.active = true;
          
    }

    onSignupCloseClick() {
        this.signupSprite.node.active = false;
    }

    onLoginClick() {
        this.loginSprite.node.active = true;
          
    }

    onLoginCloseClick() {
        this.loginSprite.node.active = false;
    }

    async firebaseSignup() {
        if(this.signupEmail.string == "" || this.signupPassword.string == "" || this.signupUsername.string == "") {
            console.log("return done");
            return;
        }
        console.log("return passed");
        try {
            const userCredential = await firebase
              .auth()
              .createUserWithEmailAndPassword(this.signupEmail.string, this.signupPassword.string);
        
            await userCredential.user?.updateProfile({
              displayName: this.signupUsername.string,
            });
            const db = firebase.database();
            const userRef = db.ref('users/' + userCredential.user?.uid);
            userRef.set({
              coins: 0,
              score: 0,
              selectedShipIndex: 0,
              shipUnLocked: [true, false, false, false, false],
              stage: [true, false, false],
              bgm: 100,
              sfx: 100,              
              name: this.signupUsername.string,
            });
            this.signupSprite.node.active = false;
            this.signupEmail.string = "";
            this.signupPassword.string = "";
            this.signupUsername.string = "";
          } catch (error) {
            console.log(error);
          }
          
    }

    async firebaseLogin() {
        if(this.loginEmail.string == "" || this.loginPassword.string == "") {
            return;
        }
        try {
            await firebase
              .auth()
              .signInWithEmailAndPassword(this.loginEmail.string, this.loginPassword.string);
        
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                  // User is signed in.
                  console.log(`Signed in as ${user.displayName}`);
                  cc.director.loadScene("Lobby");
                } else {
                  // No user is signed in.
                  console.log("No user signed in");
                }
              });
          } catch (error) {
            console.log(error);
          }
    }
}

