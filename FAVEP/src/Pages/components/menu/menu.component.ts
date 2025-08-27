import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Alterado: Importado para diretivas comuns
import { RouterModule } from '@angular/router'; // Alterado: Importado para que os links (routerLink) funcionem

@Component({
  selector: 'app-menu',
  standalone: true, // Alterado: Componente definido como standalone
  imports: [CommonModule, RouterModule], // Alterado: Adicionado imports para standalone, incluindo RouterModule
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  // Alterado: Adicionada a propriedade de Input para receber o estado (aberto/fechado) do menu
  @Input() menuAberto: boolean = false;
}