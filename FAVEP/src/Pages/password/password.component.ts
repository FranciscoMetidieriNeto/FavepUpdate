import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe o FormsModule

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicione CommonModule e FormsModule aqui
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent {
  // Propriedades para vincular aos campos do formulário
  senha = '';
  confirmarSenha = '';
  mensagemErro = '';
  mensagemSucesso = '';

  constructor() { }

  // Função chamada ao enviar o formulário
  onSubmit(): void {
    // Limpa mensagens anteriores
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // 1. Verifica se os campos estão preenchidos
    if (!this.senha || !this.confirmarSenha) {
      this.mensagemErro = 'Por favor, preencha ambos os campos de senha.';
      return;
    }

    // 2. Verifica se as senhas são iguais
    if (this.senha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem. Tente novamente.';
      return;
    }

    // 3. Se tudo estiver correto, prossiga com a lógica
    // (Aqui você chamaria seu serviço para salvar a nova senha no backend)
    console.log('Senhas coincidem. Enviando para o backend...');
    this.mensagemSucesso = 'Senha definida com sucesso!';
    
    // Opcional: Limpar os campos após o sucesso
    // this.senha = '';
    // this.confirmarSenha = '';
  }
}