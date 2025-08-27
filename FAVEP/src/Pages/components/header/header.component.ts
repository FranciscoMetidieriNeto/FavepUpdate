import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Alterado: Importado para permitir o uso de diretivas como *ngIf

@Component({
  selector: 'app-header',
  standalone: true, // Alterado: Componente definido como standalone para poder ser importado diretamente
  imports: [CommonModule], // Alterado: Adicionado o imports array para componentes standalone
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // Alterado: Adicionada a propriedade de Input para receber o nome do usuário da página pai
  @Input() usuarioNome: string = '';

  // Alterado: Adicionada a propriedade de Input para receber a foto do usuário da página pai
  @Input() usuarioFoto: string = '';

  // Alterado: Adicionada a propriedade de Output para emitir um evento quando o menu for clicado
  @Output() menuToggle = new EventEmitter<void>();

  // Alterado: Adicionada a função que emite o evento para o componente pai
  alternarMenu(): void {
    this.menuToggle.emit();
  }
}