import { Button } from '../../src/components/ui/button';

describe('Button Component - Teste Simples', () => {
  it('deve renderizar um botão básico', () => {
    cy.mount(<Button>Clique aqui</Button>);
    
    cy.get('button').should('be.visible');
    cy.get('button').should('contain.text', 'Clique aqui');
  });

  it('deve executar função quando clicado', () => {
    const handleClick = cy.stub();
    
    cy.mount(<Button onClick={handleClick}>Clique</Button>);
    
    cy.get('button').click();
    
    cy.then(() => {
      expect(handleClick).to.have.been.called;
    });
  });

  it('deve estar desabilitado quando disabled', () => {
    cy.mount(<Button disabled>Desabilitado</Button>);
    
    cy.get('button').should('be.disabled');
    cy.get('button').should('contain.text', 'Desabilitado');
  });

  it('deve ter diferentes variantes', () => {
    cy.mount(
      <div>
        <Button variant="default">Padrão</Button>
        <Button variant="destructive">Destrutivo</Button>
        <Button variant="outline">Outline</Button>
      </div>
    );
    
    cy.get('button').should('have.length', 3);
    cy.get('button').should('contain.text', 'Padrão');
    cy.get('button').should('contain.text', 'Destrutivo');
    cy.get('button').should('contain.text', 'Outline');
  });
});
