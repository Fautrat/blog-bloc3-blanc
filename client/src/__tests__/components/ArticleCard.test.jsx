import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard';
import { describe, it, expect } from 'vitest';

const mockArticle = {
    id: 1,
    title: 'Titre de test',
    content: 'Ceci est un contenu de test assez long pour être coupé.',
    username: 'AuteurTest',
    image: '/test-image.jpg'
};

describe('Composant ArticleCard', () => {
    it('doit afficher le titre et le nom de l\'auteur', () => {
        render(
            <BrowserRouter>
                <ArticleCard article={mockArticle} />
            </BrowserRouter>
        );

        // Vérifie que le titre est bien dans le document
        expect(screen.getByText('Titre de test')).toBeInTheDocument();
        
        // Vérifie que l'auteur est affiché
        expect(screen.getByText('AuteurTest')).toBeInTheDocument();
        
        // Vérifie que le lien "Lire la suite" pointe vers la bonne URL
        const link = screen.getByRole('link', { name: /lire la suite/i });
        expect(link).toHaveAttribute('href', '/article/1');
    });
});