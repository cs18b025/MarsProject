#include	<stdio>
#include	<vector>

using namespace std;
class move{
	int x;
	int y;
};
bool moves(vector<vector<char>> board){
	for(int i=0;i<3;i++){
		for(int j=0;j<3;j++){
			if(board[i][j]=='_')return true;
		}
	}
	return false;
}
int minimax(){

}
int value(vector<vector<char>> board){
	//check for row
	for(int i=0;i<3;i++){
		if(board[i][0]==board[i][1]&&board[i][1]==board[i][2]){
			if(board[i][0]=='o') return -1;
			if(board[i][0]=='x') return 1;		
		}
	}
	//check for coloumn
	for(int i=0;i<3;i++){
		if(board[0][i]==board[1][i]&&board[1][i]==board[2][i]){
			if(board[0][i]=='o') return -1;
			if(board[0][i]=='x') return 1;		
		}
	}
	//check for diagonal
	if(board[0][0]==board[1][1]&&board[1][1]==board[2][2]){
		if(board[0][0]=='o')return -1;
		if(board[0][0]=='x')return 1;
	}
	if(board[0][2]==board[1][1]&&board[1][1]==board[2][0]){
		if(board[0][2]=='o')return -1;
		if(board[0][2]=='x')return 1;
	}

	return 0;
}
move getoptimal(vector<vector<char>> board){
	int max=-1000;
	move m;
	for(int i=0;i<3;i++){
		for(int j=0;j<3;j++){
			if(board[i][j]=='_'){
				board[i][j]='x';
				int k=minimax(board,false,0);
				if(max<k){
					max=k;
					m.x=i;
					m.y=j;
				}
			}
		}
	}
}

void main(){

	vector<vector<char>> board;
	board.resize(3);
	for(int i=0;i<3;i++){
		board[i].resize(3,'_');
	}
	int g=0;
	while(moves(board)){
		int x,y;
		cin>>x>>y;
		if(x>2||y>2){
			cout<<"Invalid"<<endl;
			continue;
		}
		board[x][y]='o';
		if(value(board)==-1){
			cout<<"You win"<<endl;
			g=1;
			break;
		}
		move b=getoptimal(board,0,true);
		board[b.x][b.y]='x';
		if(value(board)==1){
			cout<<"You lose"<<endl;
			g=1;
			break;
		}
	}
	if(g!=1) cout<<"It's a tie"<<endl;


}
