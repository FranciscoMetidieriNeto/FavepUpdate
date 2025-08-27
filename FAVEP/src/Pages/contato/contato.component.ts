import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { MenuCimaComponent } from '../navbar/menu-cima/menu-cima.component';
import { ContatoService } from '../../services/contato.service';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FooterComponent,
    RouterLinkActive,
    MenuCimaComponent
  ],
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {
  contactForm!: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private contatoService: ContatoService
  ) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.contatoService.enviarMensagem(this.contactForm.value).subscribe({
      next: (response) => {
        this.mensagemSucesso = response.message || 'Mensagem enviada com sucesso!';
        this.contactForm.reset();
        this.isLoading = false;

        // ALTERADO: Adicionado setTimeout para limpar a mensagem de sucesso após 5 segundos
        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 5000); // 5000 milissegundos = 5 segundos
      },
      error: (err) => {
        this.mensagemErro = err.error?.error || 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.';
        this.isLoading = false;

        // ALTERADO: Adicionado setTimeout para limpar a mensagem de erro após 5 segundos
        setTimeout(() => {
          this.mensagemErro = '';
        }, 5000); // 5000 milissegundos = 5 segundos
      }
    });
  }

  sendWhatsApp(event: Event) {
    event.preventDefault();
    const textoPadrao = encodeURIComponent("Olá, gostaria de mais informações sobre os serviços da FAVEP.");
    const numero = "551632520000";
    window.open(`https://wa.me/${numero}?text=${textoPadrao}`, "_blank");
  }
}