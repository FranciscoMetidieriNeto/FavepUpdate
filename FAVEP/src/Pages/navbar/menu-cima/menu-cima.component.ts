import { Component, OnInit, OnDestroy, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Usuario } from '../../../models/api.models';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './menu-cima.component.html',
  styleUrls: ['./menu-cima.component.css']
})
export class MenuCimaComponent implements OnInit, OnDestroy {
  // Propriedades para controle dos modais
  mostrarLoginModal = false;
  mostrarRegisterModal = false;
  mostrarForgotPasswordModal = false;

  // Propriedades para o formulário de Login
  loginEmail: string = '';
  loginPassword: string = '';
  loginRememberMe: boolean = false;
  loginErrorMessage: string = '';

  // Propriedades para o formulário de Registro
  registerUser: any = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';

  // Propriedades para o formulário de Esqueci a Senha
  forgotPasswordEmail: string = '';
  forgotPasswordSuccessMessage: string = '';
  forgotPasswordErrorMessage: string = '';

  // Propriedade para o usuário logado
  currentUserValue: Usuario | null = null;
  private userSubscription!: Subscription;

  // Propriedade para controlar o dropdown
  mostrarDropdown = false;

  constructor(
    public apiService: AuthService,
    private router: Router,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.mostrarDropdown) {
        this.mostrarDropdown = false;
        this.cdr.detectChanges();
      }
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.mostrarDropdown = !this.mostrarDropdown;
    console.log('toggleDropdown foi chamado! Novo estado de mostrarDropdown:', this.mostrarDropdown);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.userSubscription = this.apiService.currentUser.subscribe(user => {
      this.currentUserValue = user;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/home']);
  }

  // --- Métodos para Controle dos Modais ---

  abrirLoginModal() {
    this.fecharModals();
    this.mostrarLoginModal = true;
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginErrorMessage = '';
    this.loginRememberMe = false;
  }

  abrirRegisterModal() {
    this.fecharModals();
    this.mostrarRegisterModal = true;
    this.registerUser = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
    this.registerSuccessMessage = '';
    this.registerErrorMessage = '';
  }

  abrirForgotPasswordModal() {
    this.fecharModals();
    this.mostrarForgotPasswordModal = true;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSuccessMessage = '';
    this.forgotPasswordErrorMessage = '';
  }

  fecharModals() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = false;
    this.mostrarForgotPasswordModal = false;
  }

  // --- Métodos de Submissão dos Formulários ---

  onLoginSubmit() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginErrorMessage = "Email e senha são obrigatórios.";
      return;
    }

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.fecharModals();
        this.router.navigate(['/gerenciamento']);
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.loginErrorMessage = error.error?.error || 'Email ou senha inválidos';
      }
    });
  }

  onRegisterSubmit() {
    // 1. Validação de campos obrigatórios
    if (!this.registerUser.username || !this.registerUser.email || !this.registerUser.password || !this.registerUser.telefone || !this.registerUser.confirmarSenha) {
      this.registerErrorMessage = 'Todos os campos são obrigatórios.';
      return;
    }

    // 2. Validação para garantir que as senhas coincidem
    if (this.registerUser.password !== this.registerUser.confirmarSenha) {
      this.registerErrorMessage = 'As senhas não coincidem.';
      return;
    }

    // Limpa a mensagem de erro se a validação passar
    this.registerErrorMessage = '';

    // 3. Mapeia os campos do formulário para o formato que o back-end espera (payload)
    const payload = {
      nome: this.registerUser.username,
      email: this.registerUser.email,
      telefone: this.registerUser.telefone,
      senha: this.registerUser.password,
      confirmarSenha: this.registerUser.confirmarSenha
    };

    this.apiService.register(payload).subscribe({
      next: () => {
        this.registerSuccessMessage = 'Cadastro realizado com sucesso! Faça o login para continuar.';
        setTimeout(() => {
          this.abrirLoginModal();
        }, 2500);
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        this.registerErrorMessage = error.error?.error || 'Erro ao cadastrar. Verifique os dados.';
      }
    });
  }

  onForgotPasswordSubmit() {
    if (!this.forgotPasswordEmail) {
      this.forgotPasswordErrorMessage = "O campo de e-mail é obrigatório.";
      return;
    }
    this.forgotPasswordErrorMessage = '';
    this.forgotPasswordSuccessMessage = '';

    this.apiService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (response: any) => {
        this.forgotPasswordSuccessMessage = 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.';
      },
      error: (error: any) => {
        console.error('Erro ao enviar link de recuperação', error);
        // For security reasons, we show the same message for errors to prevent email enumeration.
        this.forgotPasswordSuccessMessage = 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.';
      }
    });
  }
}
