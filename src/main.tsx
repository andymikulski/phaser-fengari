
import React from 'react';
import { createRoot } from 'react-dom/client';

import { Card } from './scenes/Card';
import { Game } from './Game';
import listOfCardBehaviors from './resourceCardLua';

type Props = {};
type State = {
  turnCount: number,
  selectedLua: string | null,
  cardsInHand: Card[],
  cardsInPlay: Card[],
}

function stringToColor(str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var color = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

class GameContainer extends React.PureComponent<Props, State> {
  public state: State = {
    selectedLua: null,
    turnCount: 0,
    cardsInHand: [],
    cardsInPlay: [],
  };

  private game: Game;

  componentDidMount(): void {
    this.game = new Game();
    this.game.setup();

    this.updateRender();

    // window.addEventListener('keyup', () => {
    //   this.setState({ selectedLua: null });
    // });
  }

  private updateRender = () => {
    this.setState({
      turnCount: this.game.turnCount,
      cardsInHand: [].concat(this.game.hand.cards).sort((a, b) => a.getName() < b.getName() ? -1 : 1),
      cardsInPlay: [].concat(this.game.cardsInPlay.cards),
    });
  }

  private renderCard = (card: Card, idx: number) => {
    return (
      <div key={idx} className="card" style={{ backgroundColor: stringToColor(card.getName()) }} data-type={card.getName()}>
        <div className="card-container">
          <b>{card.getName()}</b><br />
          {
            (card.getCost() > 0 && <b>Costs {card.getCost()}</b>)
          }
          <hr />
          {card.getDescription()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <>

        {
          this.state.selectedLua &&
          <div className="lua-modal-container">
            <div className="lua-modal">
              <h2>Card Definition</h2>
              <pre>{this.state.selectedLua}</pre>
            </div>
          </div>
        }



        <h2>Turn #{this.state.turnCount}</h2>
        <div>
          <h2>In Play</h2>
          <div className="cardList">
            {
              this.state.cardsInPlay.map(this.renderCard)
            }
          </div>
        </div>

        <div>
          <h2>Actions</h2>
          <button disabled={this.state.cardsInHand.length >= 5} onClick={() => {
            this.game.drawCard();
            this.game.stepTurn();
            this.updateRender();
          }}>Draw Card</button>
        </div>

        <div>
          <h2>Your Hand</h2>
          <div className="cardList">
            {
              this.state.cardsInHand.map((card, idx) => (
                <div key={idx} className="card" style={{ backgroundColor: stringToColor(card.getName()) }} data-type={card.getName()}>
                  <div className="card-container">
                    <h2><b>{card.getName()}</b></h2>
                    {
                      (card.getCost() > 0 && <b style={{ float: 'right' }}>Costs {card.getCost()}</b>)
                    }
                    <hr />
                    {card.getDescription()}


                    <div className="actions">
                      <button onClick={() => {
                        this.game.discard(card);
                        this.game.stepTurn();
                        this.updateRender();
                      }}>Discard</button>
                      <button disabled={!card.checkCanBePlayed()} onClick={() => {
                        this.game.playCard(card);
                        this.game.stepTurn();
                        this.updateRender();
                      }}>Play</button>
                    </div>


                  </div>
                  <button style={{display: 'block', marginTop: '20px' }} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.setState({ selectedLua: card.getLua().trim() });
                      }}>Source</button>
                </div>
              ))
            }
          </div>
        </div>
      </>
    )
  }
}



const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<GameContainer />);