// adicionar-usuario.component.ts (Removendo simulação e refatorando loadSubUsers)

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PropriedadeService } from '../../services/propriedade.service';
import { Router, RouterLink } from '@angular/router';
import { Usuario, Propriedade } from '../../models/api.models'; 
import { Subscription, of } from 'rxjs'; // Adicionando 'of' para a simulação
import { CommonModule } from '@angular/common';
import { MenuCentralComponent } from "../menu-central/menu-central.component";
import { MenuLateralComponent } from "../menu-lateral/menu-lateral.component";

// --- NOVO MODELO (Simplificado) ---
interface SubUsuario extends Usuario {
  propriedadesAcessiveis?: Propriedade[];
}

@Component({
  selector: 'app-adicionar-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MenuCentralComponent, MenuLateralComponent],
  templateUrl: './adicionar-usuario.component.html',
  styleUrls: ['./adicionar-usuario.component.css']
})
export class AdicionarUsuarioComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription | undefined;

  // --- CONTROLE DE ABAS ---
  abaAtiva: 'adicionar' | 'visualizar' = 'adicionar';
  // --- FIM CONTROLE DE ABAS ---

  newUser = {
    email: '',
    accessLevel: ''
  };

  availableProperties: Propriedade[] = [];
  selectedProperties: { [id: string]: boolean } = {}; 

  statusMessage: string = '';
  
  subUsers: SubUsuario[] = [];
  isLoadingUsers: boolean = false; // Novo: Para loading da tabela

  constructor(
    private router: Router,
    private authService: AuthService,
    private propriedadeService: PropriedadeService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user: Usuario | null) => {
      // Lógica futura se necessário
    });

    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  // --- MÉTODOS DE CONTROLE ---
  selecionarAba(aba: 'adicionar' | 'visualizar'): void {
    this.abaAtiva = aba;
    if (aba === 'visualizar') {
      this.loadSubUsers();
    }
  }

  loadSubUsers(): void {
    this.isLoadingUsers = true;
    
    // --- LÓGICA DE SIMULAÇÃO (DEVE SER IMPLEMENTADA NO AUTHSERVICE) ---
    // Simula que os dados do mock são buscados do serviço, AGORA REQUERENDO
    // APENAS AS PROPRIEDADES JÁ CARREGADAS para popular o mock.
    
    // Este é o array de propriedades carregadas que você usou na simulação anterior.
    const props = this.availableProperties; 

    const mockSubUsers = [
      { id: 'sub1', nome: 'Gerente Operacional', email: 'gerente.op@favep.com', cargo: 'GERENTE', telefone: '00000000000', senha: 'temp', emailVerified: true, profileCompleted: true, 
        propriedadesAcessiveis: [props[0]] 
      },
      { id: 'sub2', nome: 'Funcionario Campo', email: 'func.campo@favep.com', cargo: 'FUNCIONARIO', telefone: '11111111111', senha: 'temp', emailVerified: true, profileCompleted: true, 
        propriedadesAcessiveis: [props[1], props[2]] 
      }
    ] as SubUsuario[];

    // Simula a chamada Http e o delay
    of(mockSubUsers)
        .subscribe(users => {
            this.subUsers = users.filter(user => user.propriedadesAcessiveis?.length);
            this.isLoadingUsers = false;
        });
    // --- FIM DA LÓGICA DE SIMULAÇÃO ---
  }

  getPropriedadesAcessiveis(user: SubUsuario): string {
    const props = user.propriedadesAcessiveis;
    if (!props || props.length === 0) {
      return 'Nenhuma propriedade';
    }
    // Note: Garantimos que props[i] existe antes de acessar .nomepropriedade
    return props.map(p => p ? p.nomepropriedade : 'N/A').join(', ');
  }

  trackById(index: number, item: { id: any }): any {
    return item.id;
  }
  // --- FIM MÉTODOS DE CONTROLE ---


  loadProperties(): void {
    this.propriedadeService.getPropriedades().subscribe({
      next: (props) => {
        this.availableProperties = props;
        // Se as propriedades estiverem carregadas e a aba for 'visualizar', carrega os usuários.
        if (this.abaAtiva === 'visualizar') {
            this.loadSubUsers();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar propriedades:', err);
      }
    });
  }

  getSelectedPropertyIds(): string[] {
    return Object.keys(this.selectedProperties).filter(id => this.selectedProperties[id]);
  }

  addUser(form: NgForm): void {
    if (form.valid) {
      const selectedIds = this.getSelectedPropertyIds();

      this.authService.preRegisterSubUser(this.newUser.email, this.newUser.accessLevel, selectedIds)
        .subscribe({
          next: (res) => {
            console.log('Usuário adicionado:', res);
            this.statusMessage = res.message || 'Usuário convidado com sucesso! A senha foi enviada por e-mail.';
            form.resetForm();
            this.selectedProperties = {};
            this.loadSubUsers(); // Atualiza a lista
          },
          error: (err) => {
            console.error('Erro ao adicionar usuário:', err);
            this.statusMessage = err.error?.error || 'Erro ao adicionar usuário. Tente novamente.';
          }
        });
    } else {
      this.statusMessage = 'Erro: Por favor, preencha todos os campos corretamente.';
    }
  }
}